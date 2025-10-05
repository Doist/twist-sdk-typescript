import { ENDPOINT_REACTIONS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'

type AddReactionArgs = {
    threadId?: number
    commentId?: number
    conversationMessageId?: number
    emoji: string
}

type RemoveReactionArgs = {
    threadId?: number
    commentId?: number
    conversationMessageId?: number
    emoji: string
}

/**
 * Client for interacting with Twist reaction endpoints.
 */
export class ReactionsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Adds an emoji reaction to a thread, comment, or conversation message.
     *
     * @param args - The arguments for adding a reaction.
     * @param args.threadId - Optional thread ID.
     * @param args.commentId - Optional comment ID.
     * @param args.conversationMessageId - Optional conversation message ID.
     * @param args.emoji - The emoji to react with.
     *
     * @example
     * ```typescript
     * await api.reactions.add({ threadId: 789, emoji: '👍' })
     * ```
     */
    async add(args: AddReactionArgs): Promise<void> {
        const params: Record<string, number | string | undefined> = {
            emoji: args.emoji,
        }

        if (args.threadId) {
            params.thread_id = args.threadId
        } else if (args.commentId) {
            params.comment_id = args.commentId
        } else if (args.conversationMessageId) {
            params.conversation_message_id = args.conversationMessageId
        } else {
            throw new Error('Must provide one of: threadId, commentId, or conversationMessageId')
        }

        await request<void>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_REACTIONS}/add`,
            this.apiToken,
            params,
        )
    }

    /**
     * Removes an emoji reaction from a thread, comment, or conversation message.
     *
     * @param args - The arguments for removing a reaction.
     * @param args.threadId - Optional thread ID.
     * @param args.commentId - Optional comment ID.
     * @param args.conversationMessageId - Optional conversation message ID.
     * @param args.emoji - The emoji to remove.
     *
     * @example
     * ```typescript
     * await api.reactions.remove({ threadId: 789, emoji: '👍' })
     * ```
     */
    async remove(args: RemoveReactionArgs): Promise<void> {
        const params: Record<string, number | string | undefined> = {
            emoji: args.emoji,
        }

        if (args.threadId) {
            params.thread_id = args.threadId
        } else if (args.commentId) {
            params.comment_id = args.commentId
        } else if (args.conversationMessageId) {
            params.conversation_message_id = args.conversationMessageId
        } else {
            throw new Error('Must provide one of: threadId, commentId, or conversationMessageId')
        }

        await request<void>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_REACTIONS}/remove`,
            this.apiToken,
            params,
        )
    }
}
