import { ENDPOINT_REACTIONS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'

type AddReactionArgs = {
    threadId?: number
    commentId?: number
    messageId?: number
    reaction: string
}

type RemoveReactionArgs = {
    threadId?: number
    commentId?: number
    messageId?: number
    reaction: string
}

type GetReactionsArgs = {
    threadId?: number
    commentId?: number
    messageId?: number
}

type ReactionObject = Record<string, number[]> | null

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
     * @param args.messageId - Optional message ID (for conversation messages).
     * @param args.reaction - The reaction emoji to add.
     *
     * @example
     * ```typescript
     * await api.reactions.add({ threadId: 789, reaction: '👍' })
     * ```
     */
    async add(args: AddReactionArgs): Promise<void> {
        const params: Record<string, number | string | undefined> = {
            reaction: args.reaction,
        }

        if (args.threadId) {
            params.thread_id = args.threadId
        } else if (args.commentId) {
            params.comment_id = args.commentId
        } else if (args.messageId) {
            params.message_id = args.messageId
        } else {
            throw new Error('Must provide one of: threadId, commentId, or messageId')
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
     * Gets reactions for a thread, comment, or conversation message.
     *
     * @param args - The arguments for getting reactions.
     * @param args.threadId - Optional thread ID.
     * @param args.commentId - Optional comment ID.
     * @param args.messageId - Optional message ID (for conversation messages).
     * @returns A reaction object with emoji reactions as keys and arrays of user IDs as values, or null if no reactions.
     *
     * @example
     * ```typescript
     * const reactions = await api.reactions.get({ threadId: 789 })
     * // Returns: { "👍": [1, 2, 3], "❤️": [4, 5] }
     * ```
     */
    async get(args: GetReactionsArgs): Promise<ReactionObject> {
        const params: Record<string, number | undefined> = {}

        if (args.threadId) {
            params.thread_id = args.threadId
        } else if (args.commentId) {
            params.comment_id = args.commentId
        } else if (args.messageId) {
            params.message_id = args.messageId
        } else {
            throw new Error('Must provide one of: threadId, commentId, or messageId')
        }

        const response = await request<ReactionObject>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_REACTIONS}/get`,
            this.apiToken,
            params,
        )

        return response.data
    }

    /**
     * Removes an emoji reaction from a thread, comment, or conversation message.
     *
     * @param args - The arguments for removing a reaction.
     * @param args.threadId - Optional thread ID.
     * @param args.commentId - Optional comment ID.
     * @param args.messageId - Optional message ID (for conversation messages).
     * @param args.reaction - The reaction emoji to remove.
     *
     * @example
     * ```typescript
     * await api.reactions.remove({ threadId: 789, reaction: '👍' })
     * ```
     */
    async remove(args: RemoveReactionArgs): Promise<void> {
        const params: Record<string, number | string | undefined> = {
            reaction: args.reaction,
        }

        if (args.threadId) {
            params.thread_id = args.threadId
        } else if (args.commentId) {
            params.comment_id = args.commentId
        } else if (args.messageId) {
            params.message_id = args.messageId
        } else {
            throw new Error('Must provide one of: threadId, commentId, or messageId')
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
