import type { BatchApiResponse, BatchRequestDescriptor, BatchResponseArray } from './types/batch'
import { TwistRequestError } from './types/errors'
import { camelCaseKeys, snakeCaseKeys } from './utils/case-conversion'
import { transformTimestamps } from './utils/timestamp-conversion'

/**
 * Executes multiple API requests in a single HTTP call.
 *
 * @example
 * ```typescript
 * const results = await api.batch(
 *   api.workspaceUsers.getUserById(123, 456, { batch: true }),
 *   api.workspaceUsers.getUserById(123, 789, { batch: true })
 * )
 * ```
 */
export class BatchBuilder {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : 'https://api.twist.com/api/v3/'
    }

    /**
     * Executes an array of batch request descriptors in a single API call.
     *
     * @param requests - Array of batch request descriptors
     * @returns Array of BatchResponse objects with processed data
     * @throws {TwistRequestError} If the batch request fails
     */
    async execute<T extends readonly BatchRequestDescriptor<unknown>[]>(
        requests: T,
    ): Promise<BatchResponseArray<T>> {
        if (requests.length === 0) {
            return [] as BatchResponseArray<T>
        }

        // Build the batch requests array
        const batchRequests = requests.map((descriptor) => {
            // Convert params to snake_case
            const snakeCaseParams = descriptor.params
                ? (snakeCaseKeys(descriptor.params) as Record<string, unknown>)
                : undefined

            // Build the full URL with query params for GET requests
            let url = `${this.getBaseUri()}${descriptor.url}`
            if (descriptor.method === 'GET' && snakeCaseParams) {
                const searchParams = new URLSearchParams()
                Object.entries(snakeCaseParams).forEach(([key, value]) => {
                    if (value != null) {
                        if (Array.isArray(value)) {
                            searchParams.append(key, value.join(','))
                        } else {
                            searchParams.append(key, String(value))
                        }
                    }
                })
                const queryString = searchParams.toString()
                if (queryString) {
                    url += `?${queryString}`
                }
            }

            return {
                method: descriptor.method,
                url,
            }
        })

        // Check if all requests are GET (allows parallel execution)
        const allGets = batchRequests.every((req) => req.method === 'GET')

        // Build form-urlencoded body
        const formData = new URLSearchParams()
        formData.append('requests', JSON.stringify(batchRequests))
        if (allGets) {
            formData.append('parallel', 'true')
        }

        // Execute the batch request
        const response = await fetch(`${this.getBaseUri()}batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.apiToken}`,
            },
            body: formData.toString(),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new TwistRequestError(
                `Batch request failed with status ${response.status}`,
                response.status,
                errorText,
            )
        }

        const batchApiResponses: BatchApiResponse[] = await response.json()

        // Process each response
        return batchApiResponses.map((apiResponse, index) => {
            const descriptor = requests[index]

            // Parse the body JSON
            let parsedBody: unknown
            try {
                parsedBody = apiResponse.body ? JSON.parse(apiResponse.body) : undefined
            } catch (_error) {
                parsedBody = apiResponse.body
            }

            // Apply transformations: camelCase -> timestamps
            const camelCased = camelCaseKeys(parsedBody)
            const transformed = transformTimestamps(camelCased)

            // Validate with schema if provided
            let finalData = transformed
            if (descriptor.schema && apiResponse.code >= 200 && apiResponse.code < 300) {
                try {
                    finalData = descriptor.schema.parse(transformed)
                } catch (error) {
                    // If validation fails, include the error in the response
                    console.error('Batch response validation failed:', error)
                }
            }

            // Parse headers string into object
            const headers: Record<string, string> = {}
            if (apiResponse.headers && typeof apiResponse.headers === 'string') {
                try {
                    const headerLines = apiResponse.headers.split('\n')
                    headerLines.forEach((line) => {
                        const separatorIndex = line.indexOf(':')
                        if (separatorIndex > 0) {
                            const key = line.substring(0, separatorIndex).trim()
                            const value = line.substring(separatorIndex + 1).trim()
                            headers[key] = value
                        }
                    })
                } catch (error) {
                    // If header parsing fails, just leave headers empty
                    console.error('Failed to parse batch response headers:', error)
                }
            }

            return {
                code: apiResponse.code,
                headers,
                data: finalData,
            }
        }) as BatchResponseArray<T>
    }
}
