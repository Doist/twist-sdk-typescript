import { ENDPOINT_COMMENTS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Comment, CommentSchema } from '../types/entities'
import { CreateCommentArgs, GetCommentsArgs, UpdateCommentArgs } from '../types/requests'

/**
 * Client for interacting with Twist comment endpoints.
 */
export class CommentsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all comments for a thread.
     *
     * @param args - The arguments for getting comments.
     * @param args.threadId - The thread ID.
     * @param args.from - Optional date to get comments from.
     * @param args.limit - Optional limit on number of comments returned.
     * @returns An array of comment objects.
     *
     * @example
     * ```typescript
     * const comments = await api.comments.getComments({
     *   threadId: 789,
     *   from: new Date('2024-01-01')
     * })
     * comments.forEach(c => console.log(c.content))
     * ```
     */
    async getComments(args: GetCommentsArgs): Promise<Comment[]> {
        const params: Record<string, unknown> = {
            thread_id: args.threadId,
        }

        if (args.from) params.from = Math.floor(args.from.getTime() / 1000)
        if (args.limit) params.limit = args.limit

        const response = await request<Comment[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_COMMENTS}/get`,
            this.apiToken,
            params,
        )

        return response.data.map((comment) => CommentSchema.parse(comment))
    }

    /**
     * Gets a single comment object by id.
     *
     * @param id - The comment ID.
     * @returns The comment object.
     */
    async getComment(id: number): Promise<Comment> {
        const response = await request<Comment>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_COMMENTS}/getone`,
            this.apiToken,
            { id },
        )

        return CommentSchema.parse(response.data)
    }

    /**
     * Creates a new comment on a thread.
     *
     * @param args - The arguments for creating a comment.
     * @param args.threadId - The thread ID.
     * @param args.content - The comment content.
     * @param args.recipients - Optional array of user IDs to notify.
     * @param args.attachments - Optional array of attachment objects.
     * @param args.sendAsIntegration - Optional flag to send as integration.
     * @returns The created comment object.
     *
     * @example
     * ```typescript
     * const comment = await api.comments.createComment({
     *   threadId: 789,
     *   content: 'Great idea! Let\'s proceed with this approach.'
     * })
     * ```
     */
    async createComment(args: CreateCommentArgs): Promise<Comment> {
        const response = await request<Comment>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_COMMENTS}/add`,
            this.apiToken,
            args,
        )

        return CommentSchema.parse(response.data)
    }

    /**
     * Updates a comment's properties.
     *
     * @param args - The arguments for updating a comment.
     * @param args.id - The comment ID.
     * @param args.content - Optional new comment content.
     * @param args.recipients - Optional array of user IDs to notify.
     * @param args.attachments - Optional array of attachment objects.
     * @returns The updated comment object.
     */
    async updateComment(args: UpdateCommentArgs): Promise<Comment> {
        const response = await request<Comment>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_COMMENTS}/update`,
            this.apiToken,
            args,
        )

        return CommentSchema.parse(response.data)
    }

    /**
     * Permanently deletes a comment.
     *
     * @param id - The comment ID.
     */
    async deleteComment(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_COMMENTS}/remove`, this.apiToken, {
            id,
        })
    }

    /**
     * Marks the user's read position in a thread. Used to track where the user has read up to,
     * so clients can scroll to this position and show a visual indicator (blue line).
     *
     * @param threadId - The thread ID.
     * @param commentId - The comment ID to mark as the last read position.
     *
     * @example
     * ```typescript
     * await api.comments.markPosition(789, 206113)
     * ```
     */
    async markPosition(threadId: number, commentId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_COMMENTS}/mark_position`,
            this.apiToken,
            {
                thread_id: threadId,
                comment_id: commentId,
            },
        )
    }
}
