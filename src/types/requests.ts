import { z } from 'zod'
import type { UploadFile } from '../utils/multipart-upload'
import { type Attachment, AttachmentSchema } from './entities'
import { NOTIFY_AUDIENCES } from './enums'

export const CreateChannelArgsSchema = z.object({
    workspaceId: z.number(),
    name: z.string(),
    tempId: z.number().nullable().optional(),
    userIds: z.array(z.number()).nullable().optional(),
    color: z.number().nullable().optional(),
    public: z.boolean().nullable().optional(),
    description: z.string().nullable().optional(),
    defaultGroups: z.array(z.number()).nullable().optional(),
    defaultRecipients: z.array(z.number()).nullable().optional(),
    isFavorited: z.boolean().nullable().optional(),
    icon: z.number().nullable().optional(),
})

export type CreateChannelArgs = z.infer<typeof CreateChannelArgsSchema>

export const UpdateChannelArgsSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.number().nullable().optional(),
    public: z.boolean().nullable().optional(),
    description: z.string().nullable().optional(),
    defaultGroups: z.array(z.number()).nullable().optional(),
    defaultRecipients: z.array(z.number()).nullable().optional(),
    isFavorited: z.boolean().nullable().optional(),
    icon: z.number().nullable().optional(),
})

export type UpdateChannelArgs = z.infer<typeof UpdateChannelArgsSchema>

export const CreateThreadArgsSchema = z.object({
    channelId: z.number(),
    content: z.string(),
    title: z.string().nullable().optional(),
    recipients: z.array(z.number()).nullable().optional(),
    groups: z.array(z.number()).nullable().optional(),
    tempId: z.number().nullable().optional(),
    attachments: z.array(AttachmentSchema).nullable().optional(),
})

export type CreateThreadArgs = z.infer<typeof CreateThreadArgsSchema>

export const UpdateThreadArgsSchema = z.object({
    id: z.number(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
})

export type UpdateThreadArgs = z.infer<typeof UpdateThreadArgsSchema>

export const CreateCommentArgsSchema = z.object({
    threadId: z.number(),
    content: z.string(),
    tempId: z.number().nullable().optional(),
    attachments: z.array(AttachmentSchema).nullable().optional(),
    actions: z.unknown().nullable().optional(),
    recipients: z.array(z.number()).nullable().optional(),
    groups: z.array(z.number()).nullable().optional(),
    directMentions: z.array(z.number()).nullable().optional(),
    notifyAudience: z.enum(NOTIFY_AUDIENCES).nullable().optional(),
})

export type CreateCommentArgs = z.infer<typeof CreateCommentArgsSchema>

export const UpdateCommentArgsSchema = z.object({
    id: z.number(),
    content: z.string(),
})

export type UpdateCommentArgs = z.infer<typeof UpdateCommentArgsSchema>

export const CreateConversationArgsSchema = z.object({
    workspaceId: z.number(),
    recipients: z.array(z.number()),
    title: z.string().nullable().optional(),
})

export type CreateConversationArgs = z.infer<typeof CreateConversationArgsSchema>

export const CreateMessageArgsSchema = z
    .object({
        conversationId: z.number().nullable().optional(),
        threadId: z.number().nullable().optional(),
        content: z.string(),
        attachments: z.array(AttachmentSchema).nullable().optional(),
    })
    .refine(
        (data) => {
            return (
                (data.conversationId && !data.threadId) || (!data.conversationId && data.threadId)
            )
        },
        {
            message: 'Exactly one of conversationId or threadId must be provided',
        },
    )

export type CreateMessageArgs = z.infer<typeof CreateMessageArgsSchema>

export const GetChannelsArgsSchema = z.object({
    workspaceId: z.number(),
    archived: z.boolean().nullable().optional(),
})

export type GetChannelsArgs = z.infer<typeof GetChannelsArgsSchema>

export const GetThreadsArgsSchema = z.object({
    workspaceId: z.number(),
    channelId: z.number().nullable().optional(),
    archived: z.boolean().nullable().optional(),
    newerThan: z.date().nullable().optional(),
    olderThan: z.date().nullable().optional(),
    limit: z.number().nullable().optional(),
})

export type GetThreadsArgs = Omit<
    z.infer<typeof GetThreadsArgsSchema>,
    'newerThan' | 'olderThan'
> & {
    newerThan?: Date | null
    olderThan?: Date | null
    /** @deprecated Use `newerThan` instead. */
    newer_than_ts?: number | null
    /** @deprecated Use `olderThan` instead. */
    older_than_ts?: number | null
}

export const GetCommentsArgsSchema = z.object({
    threadId: z.number(),
    from: z.date().nullable().optional(),
    newerThan: z.date().nullable().optional(),
    olderThan: z.date().nullable().optional(),
    limit: z.number().nullable().optional(),
})

export type GetCommentsArgs = Omit<z.infer<typeof GetCommentsArgsSchema>, 'from'> & {
    /** @deprecated Use `newerThan` instead. */
    from?: Date | null
}

export const GetConversationsArgsSchema = z.object({
    workspaceId: z.number(),
    archived: z.boolean().nullable().optional(),
})

export type GetConversationsArgs = z.infer<typeof GetConversationsArgsSchema>

export const GetOrCreateConversationArgsSchema = z.object({
    workspaceId: z.number(),
    userIds: z.array(z.number()),
})

export type GetOrCreateConversationArgs = z.infer<typeof GetOrCreateConversationArgsSchema>

export const AWAY_MODE_TYPES = ['parental', 'vacation', 'sickleave', 'other'] as const
export type AwayModeType = (typeof AWAY_MODE_TYPES)[number]

// Users
export type AwayMode = {
    type: AwayModeType
    dateFrom?: string
    dateTo: string
}

export type UpdateUserArgs = {
    name?: string
    email?: string
    password?: string
    defaultWorkspace?: number
    profession?: string
    contactInfo?: string
    timezone?: string
    snoozeUntil?: number
    snoozeDndStart?: string
    snoozeDndEnd?: string
    awayMode?: AwayMode
    offDays?: number[]
}

// Search
type SearchArgsCommon = {
    workspaceId: number
    channelIds?: number[]
    authorIds?: number[]
    dateFrom?: string
    dateTo?: string
    limit?: number
    cursor?: string
}

export type SearchArgs =
    | (SearchArgsCommon & { query: string; mentionSelf?: boolean })
    | (SearchArgsCommon & { query?: string; mentionSelf: true })

export type SearchThreadArgs = {
    query: string
    threadId: number
    limit?: number
    cursor?: string
}

export type SearchConversationArgs = {
    query: string
    conversationId: number
    limit?: number
    cursor?: string
}

// Conversation Messages
export type GetConversationMessagesArgs = {
    conversationId: number
    newerThan?: Date
    olderThan?: Date
    limit?: number
    cursor?: string
}

export type CreateConversationMessageArgs = {
    conversationId: number
    content: string
    attachments?: Attachment[]
    actions?: unknown[]
}

export type UpdateConversationMessageArgs = {
    id: number
    content: string
    attachments?: Attachment[]
}

// Inbox
export const ARCHIVE_FILTER_VALUES = ['active', 'archived', 'all'] as const
export type ArchiveFilter = (typeof ARCHIVE_FILTER_VALUES)[number]

export type GetInboxArgs = {
    workspaceId: number
    newerThan?: Date
    olderThan?: Date
    /** @deprecated Use `newerThan` instead. */
    since?: Date
    /** @deprecated Use `olderThan` instead. */
    until?: Date
    limit?: number
    cursor?: string
    archiveFilter?: ArchiveFilter
}

export type ArchiveAllArgs = {
    workspaceId: number
    channelIds?: number[]
    olderThan?: Date
    /** @deprecated Use `olderThan` instead. */
    until?: Date
    /** @deprecated Not supported by the archive_all endpoint — this value is ignored. */
    since?: Date
}

// Reactions
export type AddReactionArgs = {
    threadId?: number
    commentId?: number
    messageId?: number
    reaction: string
}

export type RemoveReactionArgs = {
    threadId?: number
    commentId?: number
    messageId?: number
    reaction: string
}

export type GetReactionsArgs = {
    threadId?: number
    commentId?: number
    messageId?: number
}

// Channels
export type AddChannelUserArgs = {
    id: number
    userId: number
}

export type AddChannelUsersArgs = {
    id: number
    userIds: number[]
}

export type RemoveChannelUserArgs = {
    id: number
    userId: number
}

export type RemoveChannelUsersArgs = {
    id: number
    userIds: number[]
}

// Threads
export const THREAD_ACTIONS = ['close', 'reopen'] as const
export type ThreadAction = (typeof THREAD_ACTIONS)[number]

/**
 * Shared shape for endpoints that post a comment as part of a thread action
 * (close, reopen). Identical to {@link CreateCommentArgs} except the target
 * is identified by `id` (the thread ID) instead of `threadId`.
 */
type ThreadActionCommentArgs = Omit<CreateCommentArgs, 'threadId'> & { id: number }

export type CloseThreadArgs = ThreadActionCommentArgs

export type ReopenThreadArgs = ThreadActionCommentArgs

export type MoveThreadToChannelArgs = {
    id: number
    toChannel: number
}

export type MarkThreadReadArgs = {
    id: number
    objIndex: number
}

export type MarkThreadUnreadArgs = {
    id: number
    objIndex: number
}

export type MarkThreadUnreadForOthersArgs = {
    id: number
    objIndex: number
}

export type MuteThreadArgs = {
    id: number
    minutes: number
}

// Comments
export type MarkCommentPositionArgs = {
    threadId: number
    commentId: number
}

// Conversations
export type UpdateConversationArgs = {
    id: number
    title: string
    archived?: boolean
}

export type AddConversationUserArgs = {
    id: number
    userId: number
}

export type AddConversationUsersArgs = {
    id: number
    userIds: number[]
}

export type RemoveConversationUserArgs = {
    id: number
    userId: number
}

export type RemoveConversationUsersArgs = {
    id: number
    userIds: number[]
}

export type MuteConversationArgs = {
    id: number
    minutes: number
}

// Groups
export type AddGroupUserArgs = {
    id: number
    userId: number
}

export type AddGroupUsersArgs = {
    id: number
    userIds: number[]
}

export type RemoveGroupUserArgs = {
    id: number
    userId: number
}

export type RemoveGroupUsersArgs = {
    id: number
    userIds: number[]
}

// Workspace Users
export type GetWorkspaceUsersArgs = {
    workspaceId: number
    archived?: boolean
    /**
     * Include users who have been removed from the workspace. Defaults to `false`.
     * The Twist API always returns removed users, so the SDK filters them client-side.
     */
    includeRemoved?: boolean
}

export type GetUserByIdArgs = {
    workspaceId: number
    userId: number
}

export type GetUserByEmailArgs = {
    workspaceId: number
    email: string
}

export type GetUserInfoArgs = {
    workspaceId: number
    userId: number
}

export type GetUserLocalTimeArgs = {
    workspaceId: number
    userId: number
}

// Attachments
export type UploadAttachmentArgs = {
    /**
     * The file to upload. Accepts a `Blob`/`File` (browser) or a `Uint8Array` of raw
     * bytes. A Node `Buffer` is a `Uint8Array`, so `await readFile(path)` works directly.
     */
    file: UploadFile
    /**
     * File name. Required when `file` is a `Uint8Array`; inferred from the `File.name`
     * otherwise.
     */
    fileName?: string
    /** MIME type. Defaults to the `Blob`'s type or one inferred from the file extension. */
    contentType?: string
    /** Attachment ID to use. A random UUID is generated when omitted. */
    attachmentId?: string
}
