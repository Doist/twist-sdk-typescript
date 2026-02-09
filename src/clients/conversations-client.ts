import { z } from 'zod'
import { ENDPOINT_CONVERSATIONS } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
import {
    Conversation,
    ConversationSchema,
    UnreadConversation,
    UnreadConversationSchema,
} from '../types/entities'
import { GetConversationsArgs, GetOrCreateConversationArgs } from '../types/requests'
import { BaseClient } from './base-client'

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

/**
 * Client for interacting with Twist conversation endpoints.
 */
export class ConversationsClient extends BaseClient {
    /**
     * Gets all conversations for a workspace.
     *
     * @param args - The arguments for getting conversations.
     * @param args.workspaceId - The workspace ID.
     * @param args.archived - Optional flag to include archived conversations.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns An array of conversation objects.
     *
     * @example
     * ```typescript
     * const conversations = await api.conversations.getConversations({ workspaceId: 123 })
     * conversations.forEach(c => console.log(c.title))
     * ```
     */
    getConversations(
        args: GetConversationsArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Conversation[]>
    getConversations(
        args: GetConversationsArgs,
        options?: { batch?: false },
    ): Promise<Conversation[]>
    getConversations(
        args: GetConversationsArgs,
        options?: { batch?: boolean },
    ): Promise<Conversation[]> | BatchRequestDescriptor<Conversation[]> {
        const method = 'GET'
        const url = `${ENDPOINT_CONVERSATIONS}/get`
        const params = args

        if (options?.batch) {
            return { method, url, params, schema: z.array(ConversationSchema) }
        }

        return request<Conversation[]>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) =>
            response.data.map((conversation) => ConversationSchema.parse(conversation)),
        )
    }

    /**
     * Gets a single conversation object by id.
     *
     * @param id - The conversation ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The conversation object.
     */
    getConversation(id: number, options: { batch: true }): BatchRequestDescriptor<Conversation>
    getConversation(id: number, options?: { batch?: false }): Promise<Conversation>
    getConversation(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Conversation> | BatchRequestDescriptor<Conversation> {
        const method = 'GET'
        const url = `${ENDPOINT_CONVERSATIONS}/getone`
        const params = { id }
        const schema = ConversationSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Conversation>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Gets an existing conversation or creates a new one with specified users.
     *
     * @param args - The arguments for getting or creating a conversation.
     * @param args.workspaceId - The workspace ID.
     * @param args.userIds - Array of user IDs to include in the conversation.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The conversation object (existing or newly created).
     *
     * @example
     * ```typescript
     * const conversation = await api.conversations.getOrCreateConversation({
     *   workspaceId: 123,
     *   userIds: [1, 2, 3]
     * })
     * ```
     */
    getOrCreateConversation(
        args: GetOrCreateConversationArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Conversation>
    getOrCreateConversation(
        args: GetOrCreateConversationArgs,
        options?: { batch?: false },
    ): Promise<Conversation>
    getOrCreateConversation(
        args: GetOrCreateConversationArgs,
        options?: { batch?: boolean },
    ): Promise<Conversation> | BatchRequestDescriptor<Conversation> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/get_or_create`
        const params = args
        const schema = ConversationSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Conversation>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Updates a conversation.
     *
     * @param args - The arguments for updating a conversation.
     * @param args.id - The conversation ID.
     * @param args.title - The new title for the conversation.
     * @param args.archived - Optional flag to archive/unarchive the conversation.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated conversation object.
     *
     * @example
     * ```typescript
     * const conversation = await api.conversations.updateConversation({ id: 123, title: 'New Title' })
     * ```
     */
    updateConversation(
        args: UpdateConversationArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Conversation>
    updateConversation(
        args: UpdateConversationArgs,
        options?: { batch?: false },
    ): Promise<Conversation>
    updateConversation(
        args: UpdateConversationArgs,
        options?: { batch?: boolean },
    ): Promise<Conversation> | BatchRequestDescriptor<Conversation> {
        const params: Record<string, unknown> = { id: args.id, title: args.title }
        if (args.archived !== undefined) params.archived = args.archived

        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/update`
        const schema = ConversationSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Conversation>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Archives a conversation.
     *
     * @param id - The conversation ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    archiveConversation(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    archiveConversation(id: number, options?: { batch?: false }): Promise<void>
    archiveConversation(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/archive`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Unarchives a conversation.
     *
     * @param id - The conversation ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    unarchiveConversation(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    unarchiveConversation(id: number, options?: { batch?: false }): Promise<void>
    unarchiveConversation(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/unarchive`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Adds a user to a conversation.
     *
     * @param args - The arguments for adding a user.
     * @param args.id - The conversation ID.
     * @param args.userId - The user ID to add.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    addUser(args: AddConversationUserArgs, options: { batch: true }): BatchRequestDescriptor<void>
    addUser(args: AddConversationUserArgs, options?: { batch?: false }): Promise<void>
    addUser(
        args: AddConversationUserArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/add_user`
        const params = { id: args.id, userId: args.userId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Adds multiple users to a conversation.
     *
     * @param args - The arguments for adding users.
     * @param args.id - The conversation ID.
     * @param args.userIds - Array of user IDs to add.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.conversations.addUsers({ id: 123, userIds: [456, 789, 101] })
     * ```
     */
    addUsers(args: AddConversationUsersArgs, options: { batch: true }): BatchRequestDescriptor<void>
    addUsers(args: AddConversationUsersArgs, options?: { batch?: false }): Promise<void>
    addUsers(
        args: AddConversationUsersArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/add_users`
        const params = { id: args.id, userIds: args.userIds }

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Removes a user from a conversation.
     *
     * @param args - The arguments for removing a user.
     * @param args.id - The conversation ID.
     * @param args.userId - The user ID to remove.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    removeUser(
        args: RemoveConversationUserArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    removeUser(args: RemoveConversationUserArgs, options?: { batch?: false }): Promise<void>
    removeUser(
        args: RemoveConversationUserArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/remove_user`
        const params = { id: args.id, userId: args.userId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Removes multiple users from a conversation.
     *
     * @param args - The arguments for removing users.
     * @param args.id - The conversation ID.
     * @param args.userIds - Array of user IDs to remove.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    removeUsers(
        args: RemoveConversationUsersArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    removeUsers(args: RemoveConversationUsersArgs, options?: { batch?: false }): Promise<void>
    removeUsers(
        args: RemoveConversationUsersArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/remove_users`
        const params = { id: args.id, userIds: args.userIds }

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Marks a conversation as read.
     *
     * @param args - The arguments for marking as read.
     * @param args.id - The conversation ID.
     * @param args.objIndex - Optional index of the message to mark as last read.
     * @param args.messageId - Optional message ID to mark as last read.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    markRead(
        args: { id: number; objIndex?: number; messageId?: number },
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    markRead(
        args: { id: number; objIndex?: number; messageId?: number },
        options?: { batch?: false },
    ): Promise<void>
    markRead(
        args: { id: number; objIndex?: number; messageId?: number },
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const params: Record<string, unknown> = { id: args.id }
        if (args.objIndex !== undefined) params.obj_index = args.objIndex
        if (args.messageId !== undefined) params.message_id = args.messageId

        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/mark_read`

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Marks a conversation as unread.
     *
     * @param args - The arguments for marking as unread.
     * @param args.id - The conversation ID.
     * @param args.objIndex - Optional index of the message to mark as last unread.
     * @param args.messageId - Optional message ID to mark as last unread.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    markUnread(
        args: { id: number; objIndex?: number; messageId?: number },
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    markUnread(
        args: { id: number; objIndex?: number; messageId?: number },
        options?: { batch?: false },
    ): Promise<void>
    markUnread(
        args: { id: number; objIndex?: number; messageId?: number },
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const params: Record<string, unknown> = { id: args.id }
        if (args.objIndex !== undefined) params.obj_index = args.objIndex
        if (args.messageId !== undefined) params.message_id = args.messageId

        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/mark_unread`

        if (options?.batch) {
            return { method, url, params }
        }

        return request({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Gets unread conversations for a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns Array of unread conversation references.
     */
    getUnread(
        workspaceId: number,
        options: { batch: true },
    ): BatchRequestDescriptor<UnreadConversation[]>
    getUnread(workspaceId: number, options?: { batch?: false }): Promise<UnreadConversation[]>
    getUnread(
        workspaceId: number,
        options?: { batch?: boolean },
    ): Promise<UnreadConversation[]> | BatchRequestDescriptor<UnreadConversation[]> {
        const method = 'GET'
        const url = `${ENDPOINT_CONVERSATIONS}/get_unread`
        const params = { workspace_id: workspaceId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<UnreadConversation[]>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) =>
            response.data.map((conversation) => UnreadConversationSchema.parse(conversation)),
        )
    }

    /**
     * Mutes a conversation for a specified number of minutes.
     * The user will receive no notifications from this conversation during that period.
     *
     * @param args - The arguments for muting a conversation.
     * @param args.id - The conversation ID.
     * @param args.minutes - Number of minutes to mute the conversation.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated conversation object.
     *
     * @example
     * ```typescript
     * const conversation = await api.conversations.muteConversation({ id: 123, minutes: 30 })
     * ```
     */
    muteConversation(
        args: MuteConversationArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Conversation>
    muteConversation(args: MuteConversationArgs, options?: { batch?: false }): Promise<Conversation>
    muteConversation(
        args: MuteConversationArgs,
        options?: { batch?: boolean },
    ): Promise<Conversation> | BatchRequestDescriptor<Conversation> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/mute`
        const params = { id: args.id, minutes: args.minutes }
        const schema = ConversationSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Conversation>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Unmutes a conversation.
     *
     * @param id - The conversation ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated conversation object.
     */
    unmuteConversation(id: number, options: { batch: true }): BatchRequestDescriptor<Conversation>
    unmuteConversation(id: number, options?: { batch?: false }): Promise<Conversation>
    unmuteConversation(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Conversation> | BatchRequestDescriptor<Conversation> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATIONS}/unmute`
        const params = { id }
        const schema = ConversationSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Conversation>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }
}
