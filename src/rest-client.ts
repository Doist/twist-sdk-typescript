import { TwistRequestError } from './types/errors'
import {
    CustomFetch,
    CustomFetchResponse,
    HttpMethod,
    HttpResponse,
    RequestConfig,
} from './types/http'
import { camelCaseKeys, snakeCaseKeys } from './utils/case-conversion'
import { transformTimestamps } from './utils/timestamp-conversion'

export function paramsSerializer(params: Record<string, unknown>): string {
    const qs = new URLSearchParams()

    Object.keys(params).forEach((key) => {
        const value = params[key]
        if (value != null) {
            if (Array.isArray(value)) {
                qs.append(key, value.join(','))
            } else {
                qs.append(key, String(value))
            }
        }
    })

    return qs.toString()
}

const defaultHeaders = {
    'Content-Type': 'application/json',
}

function getAuthHeader(apiToken: string): string {
    return `Bearer ${apiToken}`
}

function getRequestConfiguration(
    baseURL: string,
    apiToken?: string,
    requestId?: string,
): RequestConfig {
    const authHeader = apiToken ? { Authorization: getAuthHeader(apiToken) } : undefined
    const requestIdHeader = requestId ? { 'X-Request-Id': requestId } : undefined
    const headers = { ...defaultHeaders, ...authHeader, ...requestIdHeader }

    return { baseURL, headers, timeout: 30000 }
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function isNetworkError(error: Error): boolean {
    return error.name === 'TypeError' || error.message.toLowerCase().includes('network')
}

function getRetryDelay(retryCount: number): number {
    return retryCount === 1 ? 0 : 500
}

/**
 * Converts native fetch Response to CustomFetchResponse for consistent interface
 */
function convertResponseToCustomFetch(response: Response): CustomFetchResponse {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
        headers[key] = value
    })

    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers,
        text: () => response.clone().text(),
        json: () => response.json(),
    }
}

export async function fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    customFetch?: CustomFetch,
): Promise<HttpResponse<T>> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Use custom fetch if provided, otherwise use native fetch
            const response: CustomFetchResponse = customFetch
                ? await customFetch(url, options)
                : convertResponseToCustomFetch(await fetch(url, options))

            const responseText = await response.text()
            let responseData: T

            try {
                responseData = responseText ? (JSON.parse(responseText) as T) : (undefined as T)
            } catch {
                responseData = responseText as T
            }

            if (!response.ok) {
                throw new TwistRequestError(
                    `Request failed with status ${response.status}`,
                    response.status,
                    responseData,
                )
            }

            // Convert snake_case keys to camelCase, then transform timestamps to Dates
            const camelCased = camelCaseKeys(responseData)
            const transformed = transformTimestamps(camelCased)

            return {
                data: transformed as T,
                status: response.status,
                headers: response.headers,
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error')

            if (attempt < maxRetries && isNetworkError(lastError)) {
                const delay = getRetryDelay(attempt + 1)
                if (delay > 0) {
                    await sleep(delay)
                }
                continue
            }

            break
        }
    }

    if (lastError instanceof TwistRequestError) {
        throw lastError
    }

    throw new TwistRequestError(lastError?.message ?? 'Request failed')
}

export type RequestArgs = {
    httpMethod: HttpMethod
    baseUri: string
    relativePath: string
    apiToken?: string
    payload?: Record<string, unknown>
    requestId?: string
    customFetch?: CustomFetch
}

export async function request<T>(args: RequestArgs): Promise<HttpResponse<T>> {
    const { httpMethod, baseUri, relativePath, apiToken, payload, requestId, customFetch } = args

    const config = getRequestConfiguration(baseUri, apiToken, requestId)
    const url = new URL(relativePath, config.baseURL).toString()

    const options: RequestInit = {
        method: httpMethod,
        headers: config.headers,
    }

    if (httpMethod === 'GET' && payload) {
        const searchParams = paramsSerializer(snakeCaseKeys(payload) as Record<string, unknown>)
        const urlWithParams = searchParams ? `${url}?${searchParams}` : url
        return fetchWithRetry<T>(urlWithParams, options, 3, customFetch)
    }

    if (payload && httpMethod !== 'GET') {
        options.body = JSON.stringify(snakeCaseKeys(payload))
    }

    return fetchWithRetry<T>(url, options, 3, customFetch)
}

export function isSuccess(response: HttpResponse): boolean {
    return response.status >= 200 && response.status < 300
}
