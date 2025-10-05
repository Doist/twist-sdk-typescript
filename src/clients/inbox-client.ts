import { ENDPOINT_INBOX, getTwistBaseUri } from '../consts/endpoints.js'
import { request } from '../rest-client.js'
import {
    InboxConversation,
    InboxConversationSchema,
    InboxThread,
    InboxThreadSchema,
} from '../types/entities.js'

type GetInboxArgs = {
    workspaceId: number
    since?: Date
    until?: Date
    limit?: number
    cursor?: string
}

type InboxCountResponse = {
    count: number
}

type ArchiveAllArgs = {
    workspaceId: number
    channelIds?: number[]
    since?: Date
    until?: Date
}

/**
 * Client for interacting with Twist inbox endpoints.
 */
export class InboxClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets inbox items (threads and conversations).
     *
     * @param args - The arguments for getting inbox.
     * @param args.workspaceId - The workspace ID.
     * @param args.since - Optional date to get items since.
     * @param args.until - Optional date to get items until.
     * @param args.limit - Optional limit on number of items returned.
     * @param args.cursor - Optional cursor for pagination.
     * @returns Inbox threads and conversations.
     *
     * @example
     * ```typescript
     * const inbox = await api.inbox.getInbox({
     *   workspaceId: 123,
     *   since: new Date('2024-01-01')
     * })
     * ```
     */
    async getInbox(args: GetInboxArgs): Promise<{
        threads: InboxThread[]
        conversations: InboxConversation[]
    }> {
        const params: Record<string, unknown> = {
            workspace_id: args.workspaceId,
        }

        if (args.since) params.since_ts_or_obj_idx = Math.floor(args.since.getTime() / 1000)
        if (args.until) params.until_ts_or_obj_idx = Math.floor(args.until.getTime() / 1000)
        if (args.limit) params.limit = args.limit
        if (args.cursor) params.cursor = args.cursor

        const response = await request<{
            threads: InboxThread[]
            conversations: InboxConversation[]
        }>('GET', this.getBaseUri(), `${ENDPOINT_INBOX}/get`, this.apiToken, params)

        return {
            threads: response.data.threads.map((thread) => InboxThreadSchema.parse(thread)),
            conversations: response.data.conversations.map((conversation) =>
                InboxConversationSchema.parse(conversation),
            ),
        }
    }

    /**
     * Gets unread count for inbox.
     *
     * @param workspaceId - The workspace ID.
     * @returns The unread count.
     *
     * @example
     * ```typescript
     * const count = await api.inbox.getCount(123)
     * console.log(`Unread items: ${count}`)
     * ```
     */
    async getCount(workspaceId: number): Promise<number> {
        const response = await request<InboxCountResponse>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_INBOX}/get_count`,
            this.apiToken,
            { workspace_id: workspaceId },
        )

        return response.data.count
    }

    /**
     * Archives a thread in the inbox.
     *
     * @param id - The thread ID.
     *
     * @example
     * ```typescript
     * await api.inbox.archiveThread(456)
     * ```
     */
    async archiveThread(id: number): Promise<void> {
        await request<void>('POST', this.getBaseUri(), `${ENDPOINT_INBOX}/archive`, this.apiToken, {
            id,
        })
    }

    /**
     * Unarchives a thread in the inbox.
     *
     * @param id - The thread ID.
     *
     * @example
     * ```typescript
     * await api.inbox.unarchiveThread(456)
     * ```
     */
    async unarchiveThread(id: number): Promise<void> {
        await request<void>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_INBOX}/unarchive`,
            this.apiToken,
            { id },
        )
    }

    /**
     * Marks all inbox items as read in a workspace.
     *
     * @param workspaceId - The workspace ID.
     *
     * @example
     * ```typescript
     * await api.inbox.markAllRead(123)
     * ```
     */
    async markAllRead(workspaceId: number): Promise<void> {
        await request<void>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_INBOX}/mark_all_read`,
            this.apiToken,
            { workspace_id: workspaceId },
        )
    }

    /**
     * Archives all inbox items in a workspace.
     *
     * @param args - The arguments for archiving all.
     * @param args.workspaceId - The workspace ID.
     * @param args.channelIds - Optional array of channel IDs to filter by.
     * @param args.since - Optional date to filter items since.
     * @param args.until - Optional date to filter items until.
     *
     * @example
     * ```typescript
     * await api.inbox.archiveAll({
     *   workspaceId: 123,
     *   since: new Date('2024-01-01')
     * })
     * ```
     */
    async archiveAll(args: ArchiveAllArgs): Promise<void> {
        const params: Record<string, unknown> = {
            workspace_id: args.workspaceId,
        }

        if (args.channelIds) params.channel_ids = args.channelIds
        if (args.since) params.since_ts_or_obj_idx = Math.floor(args.since.getTime() / 1000)
        if (args.until) params.until_ts_or_obj_idx = Math.floor(args.until.getTime() / 1000)

        await request<void>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_INBOX}/archive_all`,
            this.apiToken,
            params,
        )
    }
}
