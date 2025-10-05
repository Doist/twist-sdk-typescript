import { ENDPOINT_SEARCH, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { SearchResult, SearchResultSchema } from '../types/entities'

type SearchArgs = {
    query: string
    workspaceId: number
    channelIds?: number[]
    authorIds?: number[]
    mentionSelf?: boolean
    dateFrom?: string
    dateTo?: string
    limit?: number
    cursor?: string
}

type SearchThreadArgs = {
    query: string
    threadId: number
    limit?: number
    cursor?: string
}

type SearchConversationArgs = {
    query: string
    conversationId: number
    limit?: number
    cursor?: string
}

type SearchResponse = {
    items: SearchResult[]
    nextCursorMark?: string
    hasMore: boolean
    isPlanRestricted: boolean
}

type SearchThreadResponse = {
    commentIds: number[]
}

type SearchConversationResponse = {
    messageIds: number[]
}

/**
 * Client for interacting with Twist search endpoints.
 */
export class SearchClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Searches across all threads and conversations in a workspace.
     *
     * @param args - The arguments for searching.
     * @param args.query - The search query string.
     * @param args.workspaceId - The workspace ID to search in.
     * @param args.channelIds - Optional array of channel IDs to filter by.
     * @param args.authorIds - Optional array of author user IDs to filter by.
     * @param args.mentionSelf - Optional flag to filter by mentions of the current user.
     * @param args.dateFrom - Optional start date for filtering (YYYY-MM-DD).
     * @param args.dateTo - Optional end date for filtering (YYYY-MM-DD).
     * @param args.limit - Optional limit on number of results returned.
     * @param args.cursor - Optional cursor for pagination.
     * @returns Search results with pagination.
     *
     * @example
     * ```typescript
     * const results = await api.search.search({
     *   query: 'important meeting',
     *   workspaceId: 123
     * })
     * ```
     */
    async search(args: SearchArgs): Promise<SearchResponse> {
        const params: Record<string, unknown> = {
            query: args.query,
            workspace_id: args.workspaceId,
        }

        if (args.channelIds) params.channel_ids = args.channelIds
        if (args.authorIds) params.author_ids = args.authorIds
        if (args.mentionSelf !== undefined) params.mention_self = args.mentionSelf
        if (args.dateFrom) params.date_from = args.dateFrom
        if (args.dateTo) params.date_to = args.dateTo
        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const response = await request<SearchResponse>(
            'GET',
            this.getBaseUri(),
            ENDPOINT_SEARCH,
            this.apiToken,
            params,
        )

        return {
            ...response.data,
            items: response.data.items.map((result) => SearchResultSchema.parse(result)),
        }
    }

    /**
     * Searches within comments of a specific thread.
     *
     * @param args - The arguments for searching within a thread.
     * @param args.query - The search query string.
     * @param args.threadId - The thread ID to search in.
     * @param args.limit - Optional limit on number of results returned.
     * @param args.cursor - Optional cursor for pagination.
     * @returns Comment IDs that match the search query.
     *
     * @example
     * ```typescript
     * const results = await api.search.searchThread({
     *   query: 'deadline',
     *   threadId: 789
     * })
     * ```
     */
    async searchThread(args: SearchThreadArgs): Promise<SearchThreadResponse> {
        const params: Record<string, unknown> = {
            query: args.query,
            thread_id: args.threadId,
        }

        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const response = await request<SearchThreadResponse>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_SEARCH}/thread`,
            this.apiToken,
            params,
        )

        return response.data
    }

    /**
     * Searches within messages of a specific conversation.
     *
     * @param args - The arguments for searching within a conversation.
     * @param args.query - The search query string.
     * @param args.conversationId - The conversation ID to search in.
     * @param args.limit - Optional limit on number of results returned.
     * @param args.cursor - Optional cursor for pagination.
     * @returns Message IDs that match the search query.
     *
     * @example
     * ```typescript
     * const results = await api.search.searchConversation({
     *   query: 'budget',
     *   conversationId: 456
     * })
     * ```
     */
    async searchConversation(args: SearchConversationArgs): Promise<SearchConversationResponse> {
        const params: Record<string, unknown> = {
            query: args.query,
            conversation_id: args.conversationId,
        }

        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const response = await request<SearchConversationResponse>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_SEARCH}/conversation`,
            this.apiToken,
            params,
        )

        return response.data
    }
}
