import { TwistRequestError } from './types/errors'
import { HttpMethod, HttpResponse, RequestConfig } from './types/http'
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

async function fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
): Promise<HttpResponse<T>> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options)

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

            const headers: Record<string, string> = {}
            response.headers.forEach((value, key) => {
                headers[key] = value
            })

            // Convert snake_case keys to camelCase, then transform timestamps to Dates
            const camelCased = camelCaseKeys(responseData)
            const transformed = transformTimestamps(camelCased)

            return {
                data: transformed as T,
                status: response.status,
                headers,
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

export async function request<T>(
    httpMethod: HttpMethod,
    baseUri: string,
    relativePath: string,
    apiToken?: string,
    payload?: Record<string, unknown>,
    requestId?: string,
): Promise<HttpResponse<T>> {
    const config = getRequestConfiguration(baseUri, apiToken, requestId)
    const url = new URL(relativePath, config.baseURL).toString()

    const options: RequestInit = {
        method: httpMethod,
        headers: config.headers,
    }

    if (httpMethod === 'GET' && payload) {
        const searchParams = paramsSerializer(snakeCaseKeys(payload) as Record<string, unknown>)
        const urlWithParams = searchParams ? `${url}?${searchParams}` : url
        return fetchWithRetry<T>(urlWithParams, options)
    }

    if (payload && httpMethod !== 'GET') {
        options.body = JSON.stringify(snakeCaseKeys(payload))
    }

    return fetchWithRetry<T>(url, options)
}

export function isSuccess(response: HttpResponse): boolean {
    return response.status >= 200 && response.status < 300
}
