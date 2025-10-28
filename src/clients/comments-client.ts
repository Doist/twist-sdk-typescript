import { ENDPOINT_COMMENTS } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { Comment, CommentSchema } from '../types/entities'
import { CreateCommentArgs, GetCommentsArgs, UpdateCommentArgs } from '../types/requests'
import { BaseClient } from './base-client'

export type MarkCommentPositionArgs = {
    threadId: number
    commentId: number
}

/**
 * Client for interacting with Twist comment endpoints.
 */
export class CommentsClient extends BaseClient {
    /**
     * Gets all comments for a thread.
     *
     * @param args - The arguments for getting comments.
     * @param args.threadId - The thread ID.
     * @param args.from - Optional date to get comments from.
     * @param args.limit - Optional limit on number of comments returned.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    getComments(args: GetCommentsArgs, options: { batch: true }): BatchRequestDescriptor<Comment[]>
    getComments(args: GetCommentsArgs, options?: { batch?: false }): Promise<Comment[]>
    getComments(
        args: GetCommentsArgs,
        options?: { batch?: boolean },
    ): Promise<Comment[]> | BatchRequestDescriptor<Comment[]> {
        const params: Record<string, unknown> = {
            thread_id: args.threadId,
        }

        if (args.from) params.from = Math.floor(args.from.getTime() / 1000)
        if (args.limit) params.limit = args.limit

        const method = 'GET'
        const url = `${ENDPOINT_COMMENTS}/get`

        if (options?.batch) {
            return { method, url, params }
        }

        return request<Comment[]>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => response.data.map((comment) => CommentSchema.parse(comment)),
        )
    }

    /**
     * Gets a single comment object by id.
     *
     * @param id - The comment ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The comment object.
     */
    getComment(id: number, options: { batch: true }): BatchRequestDescriptor<Comment>
    getComment(id: number, options?: { batch?: false }): Promise<Comment>
    getComment(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Comment> | BatchRequestDescriptor<Comment> {
        const method = 'GET'
        const url = `${ENDPOINT_COMMENTS}/getone`
        const params = { id }
        const schema = CommentSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Comment>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    createComment(
        args: CreateCommentArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Comment>
    createComment(args: CreateCommentArgs, options?: { batch?: false }): Promise<Comment>
    createComment(
        args: CreateCommentArgs,
        options?: { batch?: boolean },
    ): Promise<Comment> | BatchRequestDescriptor<Comment> {
        const method = 'POST'
        const url = `${ENDPOINT_COMMENTS}/add`
        const params = args
        const schema = CommentSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Comment>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Updates a comment's properties.
     *
     * @param args - The arguments for updating a comment.
     * @param args.id - The comment ID.
     * @param args.content - Optional new comment content.
     * @param args.recipients - Optional array of user IDs to notify.
     * @param args.attachments - Optional array of attachment objects.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated comment object.
     */
    updateComment(
        args: UpdateCommentArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Comment>
    updateComment(args: UpdateCommentArgs, options?: { batch?: false }): Promise<Comment>
    updateComment(
        args: UpdateCommentArgs,
        options?: { batch?: boolean },
    ): Promise<Comment> | BatchRequestDescriptor<Comment> {
        const method = 'POST'
        const url = `${ENDPOINT_COMMENTS}/update`
        const params = args
        const schema = CommentSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Comment>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Permanently deletes a comment.
     *
     * @param id - The comment ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    deleteComment(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    deleteComment(id: number, options?: { batch?: false }): Promise<void>
    deleteComment(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_COMMENTS}/remove`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }

    /**
     * Marks the user's read position in a thread. Used to track where the user has read up to,
     * so clients can scroll to this position and show a visual indicator (blue line).
     *
     * @param args - The arguments for marking read position.
     * @param args.threadId - The thread ID.
     * @param args.commentId - The comment ID to mark as the last read position.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.comments.markPosition({ threadId: 789, commentId: 206113 })
     * ```
     */
    markPosition(
        args: MarkCommentPositionArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    markPosition(args: MarkCommentPositionArgs, options?: { batch?: false }): Promise<void>
    markPosition(
        args: MarkCommentPositionArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_COMMENTS}/mark_position`
        const params = {
            thread_id: args.threadId,
            comment_id: args.commentId,
        }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }
}
