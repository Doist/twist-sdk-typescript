import { ENDPOINT_COMMENTS } from '../consts/endpoints'
import { request } from '../transport/http-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { type Comment, CommentSchema } from '../types/entities'
import { NOTIFY_AUDIENCE_GROUP_IDS, NOTIFY_AUDIENCES, type NotifyAudience } from '../types/enums'
import type { CustomFetch } from '../types/http'
import type { CreateCommentArgs, ThreadAction } from '../types/requests'

type ClientContext = {
    baseUri: string
    apiToken: string
    customFetch?: CustomFetch
}

const SENTINEL_GROUP_IDS: ReadonlySet<number> = new Set(Object.values(NOTIFY_AUDIENCE_GROUP_IDS))

function isNotifyAudience(value: unknown): value is NotifyAudience {
    return typeof value === 'string' && (NOTIFY_AUDIENCES as readonly string[]).includes(value)
}

function applyNotifyAudience(params: CreateCommentArgs): Omit<CreateCommentArgs, 'notifyAudience'> {
    if (params.groups) {
        const offending = params.groups.filter((id) => SENTINEL_GROUP_IDS.has(id))
        if (offending.length > 0) {
            throw new Error(
                `\`groups\` must not contain reserved sentinel IDs (${offending.join(', ')}). Use \`notifyAudience\` instead.`,
            )
        }
    }

    if (params.notifyAudience == null) return params

    if (!isNotifyAudience(params.notifyAudience)) {
        throw new Error(
            `Invalid \`notifyAudience\` value "${String(params.notifyAudience)}". Expected one of: ${NOTIFY_AUDIENCES.join(', ')}.`,
        )
    }

    const sentinel = NOTIFY_AUDIENCE_GROUP_IDS[params.notifyAudience]
    const { notifyAudience: _stripped, groups, ...rest } = params
    return { ...rest, groups: [...(groups ?? []), sentinel] }
}

export function addCommentRequest(
    context: ClientContext,
    params: CreateCommentArgs,
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
