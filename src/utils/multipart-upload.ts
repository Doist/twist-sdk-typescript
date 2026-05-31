import { fetchWithRetry } from '../transport/fetch-with-retry'
import type { CustomFetch } from '../types/http'

/**
 * File content accepted by the upload helpers.
 *
 * - `Blob`/`File` — browser (or any runtime with a global `Blob`).
 * - `Buffer` — Node.js in-memory bytes (requires `fileName`).
 * - `ReadableStream` — Node.js stream; buffered fully before upload (requires `fileName`).
 * - `string` — path to a file on the local filesystem (`fileName` inferred from the path).
 */
export type UploadFile = Buffer | NodeJS.ReadableStream | string | Blob

type UploadMultipartFileArgs = {
    /** Base API URI with trailing slash, e.g. `https://api.twist.com/api/v3/`. */
    baseUrl: string
    /** API token used for `Authorization: Bearer`. */
    authToken: string
    /** Relative endpoint path, e.g. `attachments/upload`. */
    endpoint: string
    /** File content to upload. */
    file: UploadFile
    /** File name. Required for `Buffer`/stream inputs; inferred for paths and `File`s. */
    fileName?: string
    /** MIME type. Defaults to the `Blob`'s type or one inferred from the file extension. */
    contentType?: string
    /** Extra multipart fields to send alongside the file metadata fields. */
    additionalFields?: Record<string, string | number | boolean | undefined | null>
    /** Optional request ID for tracing. */
    requestId?: string
    /** Optional custom fetch implementation. */
    customFetch?: CustomFetch
}

/**
 * Determine a content-type from a filename extension. Falls back to
 * `application/octet-stream` for unknown extensions.
 */
export function getContentTypeFromFileName(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop()
    switch (extension) {
        case 'png':
            return 'image/png'
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg'
        case 'gif':
            return 'image/gif'
        case 'webp':
            return 'image/webp'
        case 'svg':
            return 'image/svg+xml'
        case 'pdf':
            return 'application/pdf'
        default:
            return 'application/octet-stream'
    }
}

function isReadableStream(value: unknown): value is NodeJS.ReadableStream {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { pipe?: unknown }).pipe === 'function'
    )
}

/**
 * Normalise any supported {@link UploadFile} into a `Blob` plus a resolved file name and
 * content type, so uploads use the cross-platform global `FormData`/`Blob` body that
 * `undici` and browsers both accept natively (no `duplex`/stream-body quirks).
 */
async function toBlob(
    file: UploadFile,
    fileName: string | undefined,
    contentType: string | undefined,
): Promise<{ blob: Blob; fileName: string; contentType: string }> {
    if (file instanceof Blob) {
        const resolvedName = fileName || (file instanceof File ? file.name : undefined) || 'upload'
        const type = contentType || file.type || getContentTypeFromFileName(resolvedName)
        // Re-wrap only when we need to stamp a type the Blob doesn't already carry.
        const blob = file.type === type ? file : new Blob([file], { type })
        return { blob, fileName: resolvedName, contentType: type }
    }

    if (typeof file === 'string') {
        // File path: read bytes via Node's fs (dynamic import keeps this out of browser bundles).
        const [{ readFile }, path] = await Promise.all([import('fs/promises'), import('path')])
        const resolvedName = fileName || path.basename(file)
        const type = contentType || getContentTypeFromFileName(resolvedName)
        const bytes = await readFile(file)
        return {
            blob: new Blob([new Uint8Array(bytes)], { type }),
            fileName: resolvedName,
            contentType: type,
        }
    }

    if (Buffer.isBuffer(file)) {
        if (!fileName) {
            throw new Error('fileName is required when uploading from a Buffer')
        }
        const type = contentType || getContentTypeFromFileName(fileName)
        return { blob: new Blob([new Uint8Array(file)], { type }), fileName, contentType: type }
    }

    if (isReadableStream(file)) {
        if (!fileName) {
            throw new Error('fileName is required when uploading from a stream')
        }
        const { buffer } = await import('stream/consumers')
        const bytes = await buffer(file)
        const type = contentType || getContentTypeFromFileName(fileName)
        return { blob: new Blob([new Uint8Array(bytes)], { type }), fileName, contentType: type }
    }

    throw new Error('Unsupported file type for upload')
}

/**
 * Upload a file using `multipart/form-data`.
 *
 * Builds the request body with the global `FormData`/`Blob` so it works unchanged in the
 * browser and in Node.js (via `undici`). The `file` part is sent alongside `file_name`,
 * `file_size`, and `underlying_type` fields (the canonical Twist upload shape); any
 * `additionalFields` are merged in and override the derived values. Authentication uses
 * `Authorization: Bearer`, matching every other Twist SDK client, and `Content-Type` is
 * intentionally left unset so the runtime adds the correct multipart boundary.
 *
 * The response is JSON-parsed and camel-cased by {@link fetchWithRetry}; callers validate
 * the returned shape with the appropriate schema.
 */
export async function uploadMultipartFile<T>(args: UploadMultipartFileArgs): Promise<T> {
    const {
        baseUrl,
        authToken,
        endpoint,
        file,
        fileName,
        contentType,
        additionalFields,
        requestId,
        customFetch,
    } = args

    const {
        blob,
        fileName: resolvedFileName,
        contentType: resolvedType,
    } = await toBlob(file, fileName, contentType)

    const fields: Record<string, string | number | boolean | undefined | null> = {
        file_name: resolvedFileName,
        file_size: blob.size,
        underlying_type: resolvedType,
        ...additionalFields,
    }

    const form = new FormData()
    form.append('file', blob, resolvedFileName)
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
            form.append(key, String(value))
        }
    }

    const headers: Record<string, string> = {
        Authorization: `Bearer ${authToken}`,
    }
    if (requestId) {
        headers['X-Request-Id'] = requestId
    }

    const url = new URL(endpoint, baseUrl).toString()

    const response = await fetchWithRetry<T>(
        url,
        {
            method: 'POST',
            headers,
            body: form,
            // Don't set Content-Type — the runtime adds the multipart boundary.
            timeout: 30000,
        },
        3,
        customFetch,
    )

    return response.data
}
