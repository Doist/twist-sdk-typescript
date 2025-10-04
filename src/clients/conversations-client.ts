import { ENDPOINT_CONVERSATIONS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Conversation, ConversationSchema } from '../types/entities'
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
     * Marks a conversation as read.
     *
     * @param id - The conversation ID.
     */
    async markRead(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/mark_read`,
            this.apiToken,
            { id },
        )
    }

    /**
     * Marks a conversation as unread.
     *
     * @param id - The conversation ID.
     */
    async markUnread(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/mark_unread`,
            this.apiToken,
            { id },
        )
    }

    /**
     * Gets unread conversations for a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @returns Array of unread conversation IDs.
     */
    async getUnread(workspaceId: number): Promise<number[]> {
        const response = await request<number[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/get_unread`,
            this.apiToken,
            { workspace_id: workspaceId },
        )

        return response.data
    }
}
