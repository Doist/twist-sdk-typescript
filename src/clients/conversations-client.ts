import { ENDPOINT_CONVERSATIONS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Conversation, ConversationSchema } from '../types/entities'
import { GetConversationsArgs, GetOrCreateConversationArgs } from '../types/requests'

export class ConversationsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

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

    async archiveConversation(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/archive`,
            this.apiToken,
            { id },
        )
    }

    async unarchiveConversation(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/unarchive`,
            this.apiToken,
            { id },
        )
    }

    async addUser(id: number, userId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/add_user`,
            this.apiToken,
            { id, userId },
        )
    }

    async removeUser(id: number, userId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CONVERSATIONS}/remove_user`,
            this.apiToken,
            { id, userId },
        )
    }
}
