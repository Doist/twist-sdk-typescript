import { ENDPOINT_CONVERSATION_MESSAGES, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    getMessages(
        args: GetConversationMessagesArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<ConversationMessage[]>
    getMessages(
        args: GetConversationMessagesArgs,
        options?: { batch?: false },
    ): Promise<ConversationMessage[]>
    getMessages(
        args: GetConversationMessagesArgs,
        options?: { batch?: boolean },
    ): Promise<ConversationMessage[]> | BatchRequestDescriptor<ConversationMessage[]> {
        const params: Record<string, unknown> = {
            conversation_id: args.conversationId,
        }

        if (args.newerThan) params.newer_than_ts = Math.floor(args.newerThan.getTime() / 1000)
        if (args.olderThan) params.older_than_ts = Math.floor(args.olderThan.getTime() / 1000)
        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const method = 'GET'
        const url = `${ENDPOINT_CONVERSATION_MESSAGES}/get`

        if (options?.batch) {
            return { method, url, params }
        }

        return request<ConversationMessage[]>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) =>
            response.data.map((message) => ConversationMessageSchema.parse(message)),
        )
    }

    /**
     * Gets a single conversation message by id.
     *
     * @param id - The message ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The conversation message object.
     *
     * @example
     * ```typescript
     * const message = await api.conversationMessages.getMessage(514069)
     * ```
     */
    getMessage(id: number, options: { batch: true }): BatchRequestDescriptor<ConversationMessage>
    getMessage(id: number, options?: { batch?: false }): Promise<ConversationMessage>
    getMessage(
        id: number,
        options?: { batch?: boolean },
    ): Promise<ConversationMessage> | BatchRequestDescriptor<ConversationMessage> {
        const method = 'GET'
        const url = `${ENDPOINT_CONVERSATION_MESSAGES}/getone`
        const params = { id }
        const schema = ConversationMessageSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<ConversationMessage>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) => schema.parse(response.data))
    }

    /**
     * Creates a new message in a conversation.
     *
     * @param args - The arguments for creating a message.
     * @param args.conversationId - The conversation ID.
     * @param args.content - The message content.
     * @param args.attachments - Optional array of attachment objects.
     * @param args.actions - Optional array of action objects.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    createMessage(
        args: CreateConversationMessageArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<ConversationMessage>
    createMessage(
        args: CreateConversationMessageArgs,
        options?: { batch?: false },
    ): Promise<ConversationMessage>
    createMessage(
        args: CreateConversationMessageArgs,
        options?: { batch?: boolean },
    ): Promise<ConversationMessage> | BatchRequestDescriptor<ConversationMessage> {
        const params: Record<string, unknown> = {
            conversation_id: args.conversationId,
            content: args.content,
        }

        if (args.attachments) params.attachments = args.attachments
        if (args.actions) params.actions = args.actions

        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATION_MESSAGES}/add`
        const schema = ConversationMessageSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<ConversationMessage>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) => schema.parse(response.data))
    }

    /**
     * Updates a conversation message.
     *
     * @param args - The arguments for updating a message.
     * @param args.id - The message ID.
     * @param args.content - The new message content.
     * @param args.attachments - Optional array of attachment objects.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    updateMessage(
        args: UpdateConversationMessageArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<ConversationMessage>
    updateMessage(
        args: UpdateConversationMessageArgs,
        options?: { batch?: false },
    ): Promise<ConversationMessage>
    updateMessage(
        args: UpdateConversationMessageArgs,
        options?: { batch?: boolean },
    ): Promise<ConversationMessage> | BatchRequestDescriptor<ConversationMessage> {
        const params: Record<string, unknown> = {
            id: args.id,
            content: args.content,
        }

        if (args.attachments) params.attachments = args.attachments

        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATION_MESSAGES}/update`
        const schema = ConversationMessageSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<ConversationMessage>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) => schema.parse(response.data))
    }

    /**
     * Permanently deletes a conversation message.
     *
     * @param id - The message ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.conversationMessages.deleteMessage(789)
     * ```
     */
    deleteMessage(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    deleteMessage(id: number, options?: { batch?: false }): Promise<void>
    deleteMessage(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CONVERSATION_MESSAGES}/remove`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }
}
