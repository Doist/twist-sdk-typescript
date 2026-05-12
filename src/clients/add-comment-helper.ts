import { ENDPOINT_COMMENTS } from '../consts/endpoints'
import { request } from '../transport/http-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { type Comment, CommentSchema } from '../types/entities'
import type { NotifyAudience } from '../types/enums'
import type { CustomFetch } from '../types/http'
import type { ThreadAction } from '../types/requests'

type ClientContext = {
    baseUri: string
    apiToken: string
    customFetch?: CustomFetch
}

// Twist encodes "everyone in channel" and "everyone who interacted" as magic
// group IDs in the comment-add payload's `groups` array. The SDK hides this
// detail behind `notifyAudience` and merges the sentinel into `groups` here.
const NOTIFY_AUDIENCE_GROUP_IDS: Record<NotifyAudience, number> = {
    channel: 1,
    thread: 2,
}

function applyNotifyAudience(params: Record<string, unknown>): Record<string, unknown> {
    const { notifyAudience, ...rest } = params as {
        notifyAudience?: NotifyAudience | null
    } & Record<string, unknown>
    if (!notifyAudience) return rest

    const sentinel = NOTIFY_AUDIENCE_GROUP_IDS[notifyAudience]
    const existing = Array.isArray(rest.groups) ? (rest.groups as number[]) : []
    return { ...rest, groups: Array.from(new Set([...existing, sentinel])) }
}

export function addCommentRequest(
    context: ClientContext,
    params: Record<string, unknown>,
    options?: { batch?: boolean; threadAction?: ThreadAction },
): Promise<Comment> | BatchRequestDescriptor<Comment> {
    const method = 'POST'
    const url = `${ENDPOINT_COMMENTS}/add`
    const normalized = applyNotifyAudience(params)
    const payload = options?.threadAction
        ? { ...normalized, threadAction: options.threadAction }
        : normalized
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
