import { ENDPOINT_CONVERSATIONS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import {
    Conversation,
    ConversationSchema,
    UnreadConversation,
    UnreadConversationSchema,
} from '../types/entities'
import { GetConversationsArgs, GetOrCreateConversationArgs } from '../types/requests'

/**
 * Client for interacting with Twist conversation endpoints.
 */
export class ConversationsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all conversations for a workspace.
     *
     * @param args - The arguments for getting conversations.
     * @param args.workspaceId - The workspace ID.
     * @param args.archived - Optional flag to include archived conversations.
     * @returns An array of conversation objects.
     *
     * @example
     * ```typescript
     * const conversations = await api.conversations.getConversations({ workspaceId: 123 })
     * conversations.forEach(c => console.log(c.title))
     * ```
     */
    async getConversations(args: GetConversationsArgs): Promise<Conversation[]> {
        const response = await request<Conversation[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/get`,
            this.apiToken,
            args,
        )

        return response.data.map((conversation) => ConversationSchema.parse(conversation))
    }

    /**
     * Gets a single conversation object by id.
     *
     * @param id - The conversation ID.
     * @returns The conversation object.
     */
    async getConversation(id: number): Promise<Conversation> {
        const response = await request<Conversation>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/getone`,
            this.apiToken,
            { id },
        )

        return ConversationSchema.parse(response.data)
    }

    /**
     * Gets an existing conversation or creates a new one with specified users.
     *
     * @param args - The arguments for getting or creating a conversation.
     * @param args.workspaceId - The workspace ID.
     * @param args.userIds - Array of user IDs to include in the conversation.
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
    async getOrCreateConversation(args: GetOrCreateConversationArgs): Promise<Conversation> {
        const response = await request<Conversation>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/get_or_create`,
            this.apiToken,
            args,
        )

        return ConversationSchema.parse(response.data)
    }

    /**
     * Updates a conversation.
     *
     * @param id - The conversation ID.
     * @param title - The new title for the conversation.
     * @param archived - Optional flag to archive/unarchive the conversation.
     * @returns The updated conversation object.
     *
     * @example
     * ```typescript
     * const conversation = await api.conversations.updateConversation(123, 'New Title')
     * ```
     */
    async updateConversation(id: number, title: string, archived?: boolean): Promise<Conversation> {
        const params: Record<string, unknown> = { id, title }
        if (archived !== undefined) params.archived = archived

        const response = await request<Conversation>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/update`,
            this.apiToken,
            params,
        )

        return ConversationSchema.parse(response.data)
    }

    /**
     * Archives a conversation.
     *
     * @param id - The conversation ID.
     */
    async archiveConversation(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/archive`,
            this.apiToken,
            { id },
        )
    }

    /**
     * Unarchives a conversation.
     *
     * @param id - The conversation ID.
     */
    async unarchiveConversation(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/unarchive`,
            this.apiToken,
            { id },
        )
    }

    /**
     * Adds a user to a conversation.
     *
     * @param id - The conversation ID.
     * @param userId - The user ID to add.
     */
    async addUser(id: number, userId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/add_user`,
            this.apiToken,
            { id, userId },
        )
    }

    /**
     * Adds multiple users to a conversation.
     *
     * @param id - The conversation ID.
     * @param userIds - Array of user IDs to add.
     *
     * @example
     * ```typescript
     * await api.conversations.addUsers(123, [456, 789, 101])
     * ```
     */
    async addUsers(id: number, userIds: number[]): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/add_users`,
            this.apiToken,
            { id, userIds },
        )
    }

    /**
     * Removes a user from a conversation.
     *
     * @param id - The conversation ID.
     * @param userId - The user ID to remove.
     */
    async removeUser(id: number, userId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/remove_user`,
            this.apiToken,
            { id, userId },
        )
    }

    /**
     * Removes multiple users from a conversation.
     *
     * @param id - The conversation ID.
     * @param userIds - Array of user IDs to remove.
     */
    async removeUsers(id: number, userIds: number[]): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/remove_users`,
            this.apiToken,
            { id, userIds },
        )
    }

    /**
     * Marks a conversation as read.
     *
     * @param args - The arguments for marking as read.
     * @param args.id - The conversation ID.
     * @param args.objIndex - Optional index of the message to mark as last read.
     * @param args.messageId - Optional message ID to mark as last read.
     */
    async markRead(args: { id: number; objIndex?: number; messageId?: number }): Promise<void> {
        const params: Record<string, unknown> = { id: args.id }
        if (args.objIndex !== undefined) params.obj_index = args.objIndex
        if (args.messageId !== undefined) params.message_id = args.messageId

        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/mark_read`,
            this.apiToken,
            params,
        )
    }

    /**
     * Marks a conversation as unread.
     *
     * @param args - The arguments for marking as unread.
     * @param args.id - The conversation ID.
     * @param args.objIndex - Optional index of the message to mark as last unread.
     * @param args.messageId - Optional message ID to mark as last unread.
     */
    async markUnread(args: { id: number; objIndex?: number; messageId?: number }): Promise<void> {
        const params: Record<string, unknown> = { id: args.id }
        if (args.objIndex !== undefined) params.obj_index = args.objIndex
        if (args.messageId !== undefined) params.message_id = args.messageId

        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/mark_unread`,
            this.apiToken,
            params,
        )
    }

    /**
     * Gets unread conversations for a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @returns Array of unread conversation references.
     */
    async getUnread(workspaceId: number): Promise<UnreadConversation[]> {
        const response = await request<UnreadConversation[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/get_unread`,
            this.apiToken,
            { workspace_id: workspaceId },
        )

        return response.data.map((conversation) => UnreadConversationSchema.parse(conversation))
    }

    /**
     * Mutes a conversation for a specified number of minutes.
     * The user will receive no notifications from this conversation during that period.
     *
     * @param id - The conversation ID.
     * @param minutes - Number of minutes to mute the conversation.
     * @returns The updated conversation object.
     *
     * @example
     * ```typescript
     * const conversation = await api.conversations.muteConversation(123, 30)
     * ```
     */
    async muteConversation(id: number, minutes: number): Promise<Conversation> {
        const response = await request<Conversation>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/mute`,
            this.apiToken,
            { id, minutes },
        )

        return ConversationSchema.parse(response.data)
    }

    /**
     * Unmutes a conversation.
     *
     * @param id - The conversation ID.
     * @returns The updated conversation object.
     */
    async unmuteConversation(id: number): Promise<Conversation> {
        const response = await request<Conversation>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/unmute`,
            this.apiToken,
            { id },
        )

        return ConversationSchema.parse(response.data)
    }
}
