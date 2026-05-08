import type { CustomFetch, HttpMethod, HttpResponse, RequestConfig } from '../types/http'
import { snakeCaseKeys } from '../utils/case-conversion'
import { fetchWithRetry } from './fetch-with-retry'

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

// `Accept-Encoding: identity` opts out of response compression. The SDK always
// supplies a custom undici dispatcher (to honour proxy env vars and the 1ms
// keep-alive contract). On Node 24+, passing any custom dispatcher to global
// `fetch` strips the `content-encoding` header but does not decompress the
// body, leaving consumers with raw gzipped bytes. Asking the server for an
// uncompressed payload sidesteps that asymmetry across all Node versions.
const defaultHeaders = {
    'Accept-Encoding': 'identity',
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
