export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'

export type HttpResponse<T = unknown> = {
    data: T
    status: number
    headers: Record<string, string>
}

export type RequestConfig = {
    baseURL?: string
    headers?: Record<string, string>
    timeout?: number
}
