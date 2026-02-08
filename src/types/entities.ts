import { z } from 'zod'
import { getFullTwistURL } from '../utils/url-helpers'
import { USER_TYPES, WORKSPACE_PLANS } from './enums'

// Reusable schema for system messages that can be either a string or an object
export const SystemMessageSchema = z.union([z.string(), z.unknown()]).nullable().optional()

// Base user schema with common fields shared between User and WorkspaceUser
const BaseUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    shortName: z.string(),
    firstName: z.string().nullable().optional(),
    contactInfo: z.string().nullable().optional(),
    bot: z.boolean(),
    profession: z.string().nullable().optional(),
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
    awayMode: z
        .object({
            dateFrom: z.string(),
            type: z.string(),
            dateTo: z.string(),
        })
        .nullable()
        .optional(),
    restricted: z.boolean().nullable().optional(),
    setupPending: z.union([z.boolean(), z.number()]).nullable().optional(),
})

// User entity from API
export const UserSchema = BaseUserSchema.extend({
    email: z.email(),
    snoozeDndStart: z.string().nullable().optional(),
    clientId: z.string().nullable().optional(),
    cometChannel: z.string().nullable().optional(),
    lang: z.string(),
    cometServer: z.string().nullable().optional(),
    offDays: z.array(z.number()).nullable().optional(),
    defaultWorkspace: z.number().nullable().optional(),
    token: z.string().nullable().optional(),
    snoozeDndEnd: z.string().nullable().optional(),
    snoozed: z.boolean().nullable().optional(),
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
    created: z.date(),
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
export const ChannelSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable().optional(),
        creator: z.number(),
        userIds: z.array(z.number()).nullable().optional(),
        color: z.number().nullable().optional(),
        public: z.boolean(),
        workspaceId: z.number(),
        archived: z.boolean(),
        created: z.date(),
        useDefaultRecipients: z.boolean().nullable().optional(),
        defaultGroups: z.array(z.number()).nullable().optional(),
        defaultRecipients: z.array(z.number()).nullable().optional(),
        isFavorited: z.boolean().nullable().optional(),
        icon: z.number().nullable().optional(),
        version: z.number(),
        filters: z.record(z.string(), z.string()).nullable().optional(),
    })
    .transform((data) => ({
        ...data,
        url: getFullTwistURL({ workspaceId: data.workspaceId, channelId: data.id }),
    }))

export type Channel = z.infer<typeof ChannelSchema>

// Thread entity from API
export const ThreadSchema = z
    .object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        creator: z.number(),
        creatorName: z.string().nullable().optional(),
        channelId: z.number(),
        workspaceId: z.number(),
        actions: z.array(z.unknown()).nullable().optional(),
        attachments: z.array(z.unknown()).nullable().optional(),
        commentCount: z.number(),
        closed: z.boolean().nullable().optional(),
        directGroupMentions: z.array(z.number()).nullable().optional(),
        directMentions: z.array(z.number()).nullable().optional(),
        groups: z.array(z.number()).nullable().optional(),
        lastEdited: z.date().nullable().optional(),
        lastObjIndex: z.number().nullable().optional(),
        lastUpdated: z.date(),
        mutedUntil: z.date().nullable().optional(),
        participants: z.array(z.number()).nullable().optional(),
        pinned: z.boolean(),
        pinnedDate: z.date().nullable().optional(),
        posted: z.date(),
        reactions: z.record(z.string(), z.unknown()).nullable().optional(),
        recipients: z.array(z.number()).nullable().optional(),
        responders: z.array(z.number()).nullable().optional(),
        snippet: z.string(),
        snippetCreator: z.number(),
        snippetMaskAvatarUrl: z.string().nullable().optional(),
        snippetMaskPoster: z.union([z.number(), z.string()]).nullable().optional(),
        starred: z.boolean(),
        systemMessage: SystemMessageSchema,
        toEmails: z.array(z.string()).nullable().optional(),
        isArchived: z.boolean(),
        isSaved: z.boolean().nullable().optional(),
        inInbox: z.boolean().nullable().optional(),
        lastComment: z
            .object({
                id: z.number(),
                content: z.string(),
                creator: z.number(),
                creatorName: z.string(),
                threadId: z.number(),
                channelId: z.number(),
                posted: z.date(),
                systemMessage: SystemMessageSchema,
                attachments: z.array(z.unknown()).nullable().optional(),
                reactions: z.record(z.string(), z.array(z.number())).nullable().optional(),
                actions: z.array(z.unknown()).nullable().optional(),
                objIndex: z.number(),
                lastEdited: z.date().nullable().optional(),
                deleted: z.boolean(),
                deletedBy: z.number().nullable().optional(),
                directGroupMentions: z.array(z.number()).nullable().optional(),
                directMentions: z.array(z.number()).nullable().optional(),
                groups: z.array(z.number()).nullable().optional(),
                recipients: z.array(z.number()).nullable().optional(),
                toEmails: z.array(z.string()).nullable().optional(),
                version: z.number(),
                workspaceId: z.number(),
            })
            .nullable()
            .optional(),
    })
    .transform((data) => ({
        ...data,
        url: getFullTwistURL({
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            threadId: data.id,
        }),
    }))

export type Thread = z.infer<typeof ThreadSchema>

// Group entity from API
export const GroupSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    workspaceId: z.number(),
    userIds: z.array(z.number()),
    version: z.number(),
})

export type Group = z.infer<typeof GroupSchema>

// Conversation entity from API
export const ConversationSchema = z
    .object({
        id: z.number(),
        workspaceId: z.number(),
        userIds: z.array(z.number()),
        messageCount: z.number().nullable().optional(),
        lastObjIndex: z.number(),
        snippet: z.string(),
        snippetCreators: z.array(z.number()),
        lastActive: z.date(),
        mutedUntil: z.date().nullable().optional(),
        archived: z.boolean(),
        created: z.date(),
        creator: z.number(),
        title: z.string().nullable().optional(),
        private: z.boolean().nullable().optional(),
        lastMessage: z
            .object({
                id: z.number(),
                content: z.string(),
                creator: z.number(),
                conversationId: z.number(),
                posted: z.date(),
                systemMessage: SystemMessageSchema,
                attachments: z.array(z.unknown()).nullable().optional(),
                reactions: z.record(z.string(), z.array(z.number())).nullable().optional(),
                actions: z.array(z.unknown()).nullable().optional(),
                objIndex: z.number().nullable().optional(),
                lastEdited: z.date().nullable().optional(),
                deleted: z.boolean().nullable().optional(),
                directGroupMentions: z.array(z.number()).nullable().optional(),
                directMentions: z.array(z.number()).nullable().optional(),
                version: z.number().nullable().optional(),
                workspaceId: z.number().nullable().optional(),
            })
            .nullable()
            .optional(),
    })
    .transform((data) => ({
        ...data,
        url: getFullTwistURL({ workspaceId: data.workspaceId, conversationId: data.id }),
    }))

export type Conversation = z.infer<typeof ConversationSchema>

// Comment entity from API
export const CommentSchema = z
    .object({
        id: z.number(),
        content: z.string(),
        creator: z.number(),
        threadId: z.number(),
        workspaceId: z.number(),
        conversationId: z.number().nullable().optional(),
        posted: z.date(),
        lastEdited: z.date().nullable().optional(),
        directMentions: z.array(z.number()).nullable().optional(),
        directGroupMentions: z.array(z.number()).nullable().optional(),
        systemMessage: SystemMessageSchema,
        attachments: z.array(z.unknown()).nullable().optional(),
        reactions: z.record(z.string(), z.unknown()).nullable().optional(),
        objIndex: z.number().nullable().optional(),
        // Extended fields that may appear in some API responses (like inbox)
        creatorName: z.string().nullable().optional(),
        channelId: z.number(),
        recipients: z.array(z.number()).nullable().optional(),
        groups: z.array(z.number()).nullable().optional(),
        toEmails: z.array(z.string()).nullable().optional(),
        deleted: z.boolean().nullable().optional(),
        deletedBy: z.number().nullable().optional(),
        version: z.number().nullable().optional(),
        actions: z.array(z.unknown()).nullable().optional(),
    })
    .transform((data) => ({
        ...data,
        url: getFullTwistURL({
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            threadId: data.threadId,
            commentId: data.id,
        }),
    }))

export type Comment = z.infer<typeof CommentSchema>

// WorkspaceUser entity from v4 API
export const WorkspaceUserSchema = BaseUserSchema.extend({
    email: z.string().nullable().optional(),
    userType: z.enum(USER_TYPES),
    dateFormat: z.string().nullable().optional(),
    featureFlags: z.array(z.string()).nullable().optional(),
    theme: z.string().nullable().optional(),
    timeFormat: z.string().nullable().optional(),
    version: z.number(),
})

export type WorkspaceUser = z.infer<typeof WorkspaceUserSchema>

// ConversationMessage entity from API
export const ConversationMessageSchema = z
    .object({
        id: z.number(),
        content: z.string(),
        creator: z.number(),
        conversationId: z.number(),
        posted: z.date(),
        systemMessage: SystemMessageSchema,
        attachments: z.array(z.unknown()).nullable().optional(),
        reactions: z.record(z.string(), z.array(z.number())).nullable().optional(),
        actions: z.array(z.unknown()).nullable().optional(),
        objIndex: z.number().nullable().optional(),
        lastEdited: z.date().nullable().optional(),
        isDeleted: z.boolean().nullable().optional(),
        directGroupMentions: z.array(z.number()).nullable().optional(),
        directMentions: z.array(z.number()).nullable().optional(),
        version: z.number().nullable().optional(),
        workspaceId: z.number(),
    })
    .transform((data) => ({
        ...data,
        url: getFullTwistURL({
            workspaceId: data.workspaceId,
            conversationId: data.conversationId,
            messageId: data.id,
        }),
    }))

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>

// InboxThread entity from API - returns full Thread objects with additional inbox metadata
export const InboxThreadSchema = z
    .object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        creator: z.number(),
        creatorName: z.string().nullable().optional(),
        channelId: z.number(),
        workspaceId: z.number(),
        actions: z.array(z.unknown()).nullable().optional(),
        attachments: z.array(z.unknown()).nullable().optional(),
        commentCount: z.number(),
        directGroupMentions: z.array(z.number()).nullable().optional(),
        directMentions: z.array(z.number()).nullable().optional(),
        groups: z.array(z.number()).nullable().optional(),
        lastEdited: z.date().nullable().optional(),
        lastObjIndex: z.number().nullable().optional(),
        lastUpdated: z.date(),
        mutedUntil: z.date().nullable().optional(),
        participants: z.array(z.number()).nullable().optional(),
        pinned: z.boolean(),
        pinnedDate: z.date().nullable().optional(),
        posted: z.date(),
        reactions: z.record(z.string(), z.array(z.number())).nullable().optional(),
        recipients: z.array(z.number()).nullable().optional(),
        snippet: z.string(),
        snippetCreator: z.number(),
        snippetMaskAvatarUrl: z.string().nullable().optional(),
        snippetMaskPoster: z.number().nullable().optional(),
        starred: z.boolean(),
        systemMessage: SystemMessageSchema,
        isArchived: z.boolean(),
        inInbox: z.boolean(),
        isSaved: z.boolean().nullable().optional(),
        closed: z.boolean(),
        responders: z.array(z.number()).nullable().optional(),
        lastComment: CommentSchema.nullable().optional(),
        toEmails: z.array(z.string()).nullable().optional(),
        version: z.number().nullable().optional(),
    })
    .transform((data) => ({
        ...data,
        url: getFullTwistURL({
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            threadId: data.id,
        }),
    }))

export type InboxThread = z.infer<typeof InboxThreadSchema>

// UnreadThread entity from API - simplified thread reference for unread threads
export const UnreadThreadSchema = z.object({
    threadId: z.number(),
    channelId: z.number(),
    objIndex: z.number(),
    directMention: z.boolean(),
})

export type UnreadThread = z.infer<typeof UnreadThreadSchema>

// UnreadConversation entity from API - simplified conversation reference for unread conversations
export const UnreadConversationSchema = z.object({
    conversationId: z.number(),
    objIndex: z.number(),
    directMention: z.boolean(),
})

export type UnreadConversation = z.infer<typeof UnreadConversationSchema>

// SearchResult entity from API
export const SearchResultSchema = z.object({
    id: z.string(),
    type: z.enum(['thread', 'comment', 'message']),
    snippet: z.string(),
    snippetCreatorId: z.number(),
    snippetLastUpdated: z.date(),
    threadId: z.number().nullable().optional(),
    conversationId: z.number().nullable().optional(),
    commentId: z.number().nullable().optional(),
    channelId: z.number().nullable().optional(),
    channelName: z.string().nullable().optional(),
    channelColor: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    closed: z.boolean().nullable().optional(),
})

export type SearchResult = z.infer<typeof SearchResultSchema>
