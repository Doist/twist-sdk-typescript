import { ENDPOINT_COMMENTS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Comment, CommentSchema } from '../types/entities'
import { CreateCommentArgs, GetCommentsArgs, UpdateCommentArgs } from '../types/requests'

export class CommentsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    async getComments(args: GetCommentsArgs): Promise<Comment[]> {
        const response = await request<Comment[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_COMMENTS}/get`,
            this.apiToken,
            args,
        )

        return response.data.map((comment) => CommentSchema.parse(comment))
    }

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

    async deleteComment(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_COMMENTS}/remove`, this.apiToken, {
            id,
        })
    }
}
