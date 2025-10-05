import { z } from 'zod'
import { USER_TYPES, WORKSPACE_PLANS } from './enums'

// User entity from API
export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
    shortName: z.string(),
    firstName: z.string().nullable().optional(),
    contactInfo: z.string().nullable().optional(),
    bot: z.boolean(),
    profession: z.string().nullable().optional(),
    snoozeDndStart: z.string().nullable().optional(),
    clientId: z.string().nullable().optional(),
    timezone: z.string(),
    removed: z.boolean(),
    avatarId: z.string().nullable().optional(),
    avatarUrls: z
        .object({
            s35: z.string(),
            s60: z.string(),
            s195: z.string(),
            s640: z.string(),
        })
        .nullable()
        .optional(),
    cometChannel: z.string().nullable().optional(),
    lang: z.string(),
    awayMode: z
        .object({
            dateFrom: z.string(),
            type: z.string(),
            dateTo: z.string(),
        })
        .nullable()
        .optional(),
    cometServer: z.string().nullable().optional(),
    offDays: z.array(z.number()).nullable().optional(),
    restricted: z.boolean().nullable().optional(),
    defaultWorkspace: z.number().nullable().optional(),
    token: z.string().nullable().optional(),
    snoozeDndEnd: z.string().nullable().optional(),
    snoozed: z.boolean().nullable().optional(),
    setupPending: z.union([z.boolean(), z.number()]).nullable().optional(),
    snoozeUntil: z.number().nullable().optional(),
    scheduledBanners: z.array(z.string()).nullable().optional(),
})

export type User = z.infer<typeof UserSchema>

// Workspace entity from API
export const WorkspaceSchema = z.object({
    id: z.number(),
    name: z.string(),
    defaultChannel: z.number().nullable().optional(),
    defaultConversation: z.number().nullable().optional(),
    creator: z.number(),
    createdTs: z.number(),
    avatarId: z.string().nullable().optional(),
    avatarUrls: z
        .object({
            s35: z.string(),
            s60: z.string(),
            s195: z.string(),
            s640: z.string(),
        })
        .nullable()
        .optional(),
    plan: z.enum(WORKSPACE_PLANS).nullable().optional(),
})

export type Workspace = z.infer<typeof WorkspaceSchema>

// Channel entity from API
export const ChannelSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    creator: z.number(),
    userIds: z.array(z.number()).nullable().optional(),
    color: z.number().nullable().optional(),
    public: z.boolean(),
    workspaceId: z.number(),
    archived: z.boolean(),
    createdTs: z.number(),
    useDefaultRecipients: z.boolean().nullable().optional(),
    defaultGroups: z.array(z.number()).nullable().optional(),
    defaultRecipients: z.array(z.number()).nullable().optional(),
    isFavorited: z.boolean().nullable().optional(),
    icon: z.number().nullable().optional(),
})

export type Channel = z.infer<typeof ChannelSchema>

// Thread entity from API
export const ThreadSchema = z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    creator: z.number(),
    channelId: z.number(),
    workspaceId: z.number(),
    actions: z.array(z.unknown()).nullable().optional(),
    attachments: z.array(z.unknown()).nullable().optional(),
    commentCount: z.number(),
    directGroupMentions: z.array(z.number()).nullable().optional(),
    directMentions: z.array(z.number()).nullable().optional(),
    groups: z.array(z.number()).nullable().optional(),
    lastEditedTs: z.number().nullable().optional(),
    lastObjIndex: z.number().nullable().optional(),
    lastUpdatedTs: z.number(),
    mutedUntilTs: z.number().nullable().optional(),
    participants: z.array(z.number()).nullable().optional(),
    pinned: z.boolean(),
    pinnedTs: z.number().nullable().optional(),
    postedTs: z.number(),
    reactions: z.record(z.string(), z.unknown()).nullable().optional(),
    recipients: z.array(z.number()).nullable().optional(),
    snippet: z.string(),
    snippetCreator: z.number(),
    starred: z.boolean(),
    systemMessage: z.string().nullable().optional(),
    isArchived: z.boolean(),
    inInbox: z.boolean().nullable().optional(),
})

export type Thread = z.infer<typeof ThreadSchema>

// Group entity from API
export const GroupSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    workspaceId: z.number(),
    userIds: z.array(z.number()),
})

export type Group = z.infer<typeof GroupSchema>

// Conversation entity from API
export const ConversationSchema = z.object({
    id: z.number(),
    workspaceId: z.number(),
    userIds: z.array(z.number()),
    messageCount: z.number(),
    lastObjIndex: z.number(),
    snippet: z.string(),
    snippetCreators: z.array(z.number()),
    lastActiveTs: z.number(),
    mutedUntilTs: z.number().nullable().optional(),
    archived: z.boolean(),
    createdTs: z.number(),
})

export type Conversation = z.infer<typeof ConversationSchema>

// Comment entity from API
export const CommentSchema = z.object({
    id: z.number(),
    content: z.string(),
    creator: z.number(),
    threadId: z.number(),
    workspaceId: z.number().nullable().optional(),
    conversationId: z.number().nullable().optional(),
    postedTs: z.number(),
    lastEditedTs: z.number().nullable().optional(),
    directMentions: z.array(z.number()).nullable().optional(),
    directGroupMentions: z.array(z.number()).nullable().optional(),
    systemMessage: z.string().nullable().optional(),
    attachments: z.array(z.unknown()).nullable().optional(),
    reactions: z.record(z.string(), z.unknown()).nullable().optional(),
    objIndex: z.number().nullable().optional(),
})

export type Comment = z.infer<typeof CommentSchema>

// WorkspaceUser entity from v4 API
export const WorkspaceUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    userType: z.enum(USER_TYPES),
    workspaceId: z.number(),
})

export type WorkspaceUser = z.infer<typeof WorkspaceUserSchema>

// ConversationMessage entity from API
export const ConversationMessageSchema = z.object({
    id: z.number(),
    content: z.string(),
    creatorId: z.number(),
    conversationId: z.number(),
    createdTs: z.number(),
    systemMessage: z.string().nullable().optional(),
    attachments: z.array(z.unknown()).nullable().optional(),
    reactions: z.record(z.string(), z.array(z.number())).nullable().optional(),
    actions: z.array(z.unknown()).nullable().optional(),
    objIndex: z.number().nullable().optional(),
    lastEditedTs: z.number().nullable().optional(),
})

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>

// InboxThread entity from API
export const InboxThreadSchema = z.object({
    id: z.number(),
    title: z.string(),
    channelId: z.number(),
    workspaceId: z.number(),
    creatorId: z.number(),
    isUnread: z.boolean(),
    isStarred: z.boolean(),
    newestObjIndex: z.number(),
    oldestObjIndex: z.number(),
    unreadCount: z.number(),
})

export type InboxThread = z.infer<typeof InboxThreadSchema>

// InboxConversation entity from API
export const InboxConversationSchema = z.object({
    id: z.number(),
    title: z.string(),
    workspaceId: z.number(),
    isUnread: z.boolean(),
    unreadCount: z.number(),
})

export type InboxConversation = z.infer<typeof InboxConversationSchema>

// SearchResult entity from API
export const SearchResultSchema = z.object({
    id: z.number(),
    type: z.enum(['thread', 'comment', 'message']),
    content: z.string(),
    creatorId: z.number(),
    createdTs: z.number(),
    threadId: z.number().nullable().optional(),
    conversationId: z.number().nullable().optional(),
    channelId: z.number().nullable().optional(),
    workspaceId: z.number(),
})

export type SearchResult = z.infer<typeof SearchResultSchema>
