import { ENDPOINT_SEARCH } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { SearchResult, SearchResultSchema } from '../types/entities'
import { BaseClient } from './base-client'

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
export class SearchClient extends BaseClient {
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns Search results with pagination.
     *
     * @example
     * ```typescript
     * const results = await api.search.search({
     *   query: 'important meeting',
import { BaseClient, type ClientConfig } from './base-client'
     *   workspaceId: 123
     * })
     * ```
     */
    search(args: SearchArgs, options: { batch: true }): BatchRequestDescriptor<SearchResponse>
    search(args: SearchArgs, options?: { batch?: false }): Promise<SearchResponse>
    search(
        args: SearchArgs,
        options?: { batch?: boolean },
    ): Promise<SearchResponse> | BatchRequestDescriptor<SearchResponse> {
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

        const method = 'GET'
        const url = ENDPOINT_SEARCH

        if (options?.batch) {
            return { method, url, params }
        }

        return request<SearchResponse>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => ({
                ...response.data,
                items: response.data.items.map((result) => SearchResultSchema.parse(result)),
            }),
        )
    }

    /**
     * Searches within comments of a specific thread.
     *
     * @param args - The arguments for searching within a thread.
     * @param args.query - The search query string.
     * @param args.threadId - The thread ID to search in.
     * @param args.limit - Optional limit on number of results returned.
     * @param args.cursor - Optional cursor for pagination.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    searchThread(
        args: SearchThreadArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<SearchThreadResponse>
    searchThread(args: SearchThreadArgs, options?: { batch?: false }): Promise<SearchThreadResponse>
    searchThread(
        args: SearchThreadArgs,
        options?: { batch?: boolean },
    ): Promise<SearchThreadResponse> | BatchRequestDescriptor<SearchThreadResponse> {
        const params: Record<string, unknown> = {
            query: args.query,
            thread_id: args.threadId,
        }

        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const method = 'GET'
        const url = `${ENDPOINT_SEARCH}/thread`

        if (options?.batch) {
            return { method, url, params }
        }

        return request<SearchThreadResponse>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) => response.data)
    }

    /**
     * Searches within messages of a specific conversation.
     *
     * @param args - The arguments for searching within a conversation.
     * @param args.query - The search query string.
     * @param args.conversationId - The conversation ID to search in.
     * @param args.limit - Optional limit on number of results returned.
     * @param args.cursor - Optional cursor for pagination.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    searchConversation(
        args: SearchConversationArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<SearchConversationResponse>
    searchConversation(
        args: SearchConversationArgs,
        options?: { batch?: false },
    ): Promise<SearchConversationResponse>
    searchConversation(
        args: SearchConversationArgs,
        options?: { batch?: boolean },
    ): Promise<SearchConversationResponse> | BatchRequestDescriptor<SearchConversationResponse> {
        const params: Record<string, unknown> = {
            query: args.query,
            conversation_id: args.conversationId,
        }

        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const method = 'GET'
        const url = `${ENDPOINT_SEARCH}/conversation`

        if (options?.batch) {
            return { method, url, params }
        }

        return request<SearchConversationResponse>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) => response.data)
    }
}
