import { z } from 'zod'

/**
 * Descriptor for a batch request that captures the API call details
 * without executing it.
 */
export type BatchRequestDescriptor<T> = {
    method: 'GET' | 'POST'
    url: string
    params?: Record<string, unknown>
    schema?: z.ZodSchema<T>
}

/**
 * Response from a single request within a batch.
 */
export type BatchResponse<T> = {
    code: number
    headers: Record<string, string>
    data: T
}

/**
 * Raw response format from the batch API endpoint.
 * @internal
 */
export type BatchApiResponse = {
    code: number
    headers: string
    body: string
}
