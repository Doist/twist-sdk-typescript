import { ENDPOINT_COMMENTS } from '../consts/endpoints'
import { request } from '../transport/http-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { type Comment, CommentSchema } from '../types/entities'
import type { CustomFetch } from '../types/http'
import type { ThreadAction } from '../types/requests'

type ClientContext = {
    baseUri: string
    apiToken: string
    customFetch?: CustomFetch
}

export function addCommentRequest(
    context: ClientContext,
    params: Record<string, unknown>,
    options?: { batch?: boolean; threadAction?: ThreadAction },
): Promise<Comment> | BatchRequestDescriptor<Comment> {
    const method = 'POST'
    const url = `${ENDPOINT_COMMENTS}/add`
    const payload = options?.threadAction
        ? { ...params, threadAction: options.threadAction }
        : params
    const schema = CommentSchema

    if (options?.batch) {
        return { method, url, params: payload, schema }
    }

    return request<Comment>({
        httpMethod: method,
        baseUri: context.baseUri,
        relativePath: url,
        apiToken: context.apiToken,
        payload,
        customFetch: context.customFetch,
    }).then((response) => schema.parse(response.data))
}
