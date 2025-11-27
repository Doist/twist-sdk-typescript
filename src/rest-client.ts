import { Agent } from 'undici'
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

/**
 * HTTP agent with keepAlive disabled to prevent hanging connections
 * This ensures the process exits immediately after requests complete
 */
const httpAgent = new Agent({
    keepAliveTimeout: 1, // Close connections after 1ms of idle time
    keepAliveMaxTimeout: 1, // Maximum time to keep connections alive
})

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
 * Creates an AbortSignal that aborts after timeoutMs. Returns the signal and a
 * clear function to cancel the timeout early.
 */
function createTimeoutSignal(
    timeoutMs: number,
    existingSignal?: AbortSignal,
): {
    signal: AbortSignal
    clear: () => void
} {
    const controller = new AbortController()

    const timeoutId = setTimeout(() => {
        controller.abort(new Error(`Request timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    function clear() {
        clearTimeout(timeoutId)
    }

    // Forward existing signal if provided
    if (existingSignal) {
        if (existingSignal.aborted) {
            controller.abort(existingSignal.reason)
        } else {
            existingSignal.addEventListener(
                'abort',
                () => {
                    controller.abort(existingSignal.reason)
                    clear()
                },
                { once: true },
            )
        }
    }

    return { signal: controller.signal, clear }
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
    options: RequestInit & { timeout?: number },
    maxRetries: number = 3,
    customFetch?: CustomFetch,
): Promise<HttpResponse<T>> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        // Timeout clear function for this attempt (hoisted for catch scope)
        let clearTimeoutFn: (() => void) | undefined

        try {
            // Set up timeout signal (fixes timeout bug - timeout was configured but not used)
            let requestSignal = options.signal || undefined
            if (options.timeout && options.timeout > 0) {
                const timeoutResult = createTimeoutSignal(options.timeout, requestSignal)
                requestSignal = timeoutResult.signal
                clearTimeoutFn = timeoutResult.clear
            }

            // Use custom fetch if provided, otherwise use native fetch with undici agent
            const response: CustomFetchResponse = customFetch
                ? await customFetch(url, options)
                : convertResponseToCustomFetch(
                      await fetch(url, {
                          ...options,
                          signal: requestSignal,
                          // @ts-expect-error - dispatcher is valid for Node.js fetch but not in TS types
                          dispatcher: httpAgent,
                      }),
                  )

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

            // Success – clear pending timeout (if any) so Node can exit promptly
            if (clearTimeoutFn) {
                clearTimeoutFn()
            }

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

                // Retry path – ensure this attempt's timeout is cleared before looping
                if (clearTimeoutFn) {
                    clearTimeoutFn()
                }
                continue
            }

            // Final error – clear timeout before throwing
            if (clearTimeoutFn) {
                clearTimeoutFn()
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

    const options: RequestInit & { timeout?: number } = {
        method: httpMethod,
        headers: config.headers,
        timeout: config.timeout,
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
