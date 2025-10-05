import { z } from 'zod'

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
    attachments: z.unknown().nullable().optional(),
    actions: z.unknown().nullable().optional(),
    recipients: z.array(z.number()).nullable().optional(),
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
        attachments: z.array(z.number()).nullable().optional(),
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
})

export type GetThreadsArgs = z.infer<typeof GetThreadsArgsSchema>

export const GetCommentsArgsSchema = z.object({
    threadId: z.number(),
    from: z.date().nullable().optional(),
    limit: z.number().nullable().optional(),
})

export type GetCommentsArgs = z.infer<typeof GetCommentsArgsSchema>

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
