import { ENDPOINT_CONVERSATION_MESSAGES, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { ConversationMessage, ConversationMessageSchema } from '../types/entities'

type GetConversationMessagesArgs = {
    conversationId: number
    newerThan?: Date
    olderThan?: Date
    limit?: number
    cursor?: string
}

type CreateConversationMessageArgs = {
    conversationId: number
    content: string
    attachments?: unknown[]
    actions?: unknown[]
}

type UpdateConversationMessageArgs = {
    id: number
    content: string
    attachments?: unknown[]
}

/**
 * Client for interacting with Twist conversation message endpoints.
 */
export class ConversationMessagesClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all messages in a conversation.
     *
     * @param args - The arguments for getting messages.
     * @param args.conversationId - The conversation ID.
     * @param args.newerThan - Optional date to get messages newer than.
     * @param args.olderThan - Optional date to get messages older than.
     * @param args.limit - Optional limit on number of messages returned.
     * @param args.cursor - Optional cursor for pagination.
     * @returns An array of message objects.
     *
     * @example
     * ```typescript
     * const messages = await api.conversationMessages.getMessages({
     *   conversationId: 456,
     *   newerThan: new Date('2024-01-01')
     * })
     * ```
     */
    async getMessages(args: GetConversationMessagesArgs): Promise<ConversationMessage[]> {
        const params: Record<string, unknown> = {
            conversation_id: args.conversationId,
        }

        if (args.newerThan) params.newer_than_ts = Math.floor(args.newerThan.getTime() / 1000)
        if (args.olderThan) params.older_than_ts = Math.floor(args.olderThan.getTime() / 1000)
        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const response = await request<ConversationMessage[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATION_MESSAGES}/get`,
            this.apiToken,
            params,
        )

        return response.data.map((message) => ConversationMessageSchema.parse(message))
    }

    /**
     * Gets a single conversation message by id.
     *
     * @param id - The message ID.
     * @returns The conversation message object.
     *
     * @example
     * ```typescript
     * const message = await api.conversationMessages.getMessage(514069)
     * ```
     */
    async getMessage(id: number): Promise<ConversationMessage> {
        const response = await request<ConversationMessage>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATION_MESSAGES}/getone`,
            this.apiToken,
            { id },
        )

        return ConversationMessageSchema.parse(response.data)
    }

    /**
     * Creates a new message in a conversation.
     *
     * @param args - The arguments for creating a message.
     * @param args.conversationId - The conversation ID.
     * @param args.content - The message content.
     * @param args.attachments - Optional array of attachment objects.
     * @param args.actions - Optional array of action objects.
     * @returns The created message object.
     *
     * @example
     * ```typescript
     * const message = await api.conversationMessages.createMessage({
     *   conversationId: 456,
     *   content: 'Thanks for the update!'
     * })
     * ```
     */
    async createMessage(args: CreateConversationMessageArgs): Promise<ConversationMessage> {
        const params: Record<string, unknown> = {
            conversation_id: args.conversationId,
            content: args.content,
        }

        if (args.attachments) params.attachments = args.attachments
        if (args.actions) params.actions = args.actions

        const response = await request<ConversationMessage>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATION_MESSAGES}/add`,
            this.apiToken,
            params,
        )

        return ConversationMessageSchema.parse(response.data)
    }

    /**
     * Updates a conversation message.
     *
     * @param args - The arguments for updating a message.
     * @param args.id - The message ID.
     * @param args.content - The new message content.
     * @param args.attachments - Optional array of attachment objects.
     * @returns The updated message object.
     *
     * @example
     * ```typescript
     * const message = await api.conversationMessages.updateMessage({
     *   id: 789,
     *   content: 'Updated message content'
     * })
     * ```
     */
    async updateMessage(args: UpdateConversationMessageArgs): Promise<ConversationMessage> {
        const params: Record<string, unknown> = {
            id: args.id,
            content: args.content,
        }

        if (args.attachments) params.attachments = args.attachments

        const response = await request<ConversationMessage>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATION_MESSAGES}/update`,
            this.apiToken,
            params,
        )

        return ConversationMessageSchema.parse(response.data)
    }

    /**
     * Permanently deletes a conversation message.
     *
     * @param id - The message ID.
     *
     * @example
     * ```typescript
     * await api.conversationMessages.deleteMessage(789)
     * ```
     */
    async deleteMessage(id: number): Promise<void> {
        await request<void>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATION_MESSAGES}/remove`,
            this.apiToken,
            { id },
        )
    }
}
