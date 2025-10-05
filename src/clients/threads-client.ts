import { ENDPOINT_THREADS, getTwistBaseUri } from '../consts/endpoints.js'
import { request } from '../rest-client.js'
import { Thread, ThreadSchema } from '../types/entities.js'
import { CreateThreadArgs, GetThreadsArgs, UpdateThreadArgs } from '../types/requests.js'

/**
 * Client for interacting with Twist thread endpoints.
 */
export class ThreadsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all threads in a channel.
     *
     * @param args - The arguments for getting threads.
     * @param args.channelId - The channel ID.
     * @param args.workspaceId - Optional workspace ID.
     * @param args.archived - Optional flag to include archived threads.
     * @param args.newer_than_ts - Optional timestamp to get threads newer than.
     * @param args.older_than_ts - Optional timestamp to get threads older than.
     * @param args.limit - Optional limit on number of threads returned.
     * @returns An array of thread objects.
     *
     * @example
     * ```typescript
     * const threads = await api.threads.getThreads({ channelId: 456 })
     * threads.forEach(t => console.log(t.title))
     * ```
     */
    async getThreads(args: GetThreadsArgs): Promise<Thread[]> {
        const response = await request<Thread[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/get`,
            this.apiToken,
            args,
        )

        return response.data.map((thread) => ThreadSchema.parse(thread))
    }

    /**
     * Gets a single thread object by id.
     *
     * @param id - The thread ID.
     * @returns The thread object.
     */
    async getThread(id: number): Promise<Thread> {
        const response = await request<Thread>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/getone`,
            this.apiToken,
            { id },
        )

        return ThreadSchema.parse(response.data)
    }

    /**
     * Creates a new thread in a channel.
     *
     * @param args - The arguments for creating a thread.
     * @param args.channelId - The channel ID.
     * @param args.title - The thread title.
     * @param args.content - The thread content.
     * @param args.recipients - Optional array of user IDs to notify.
     * @param args.attachments - Optional array of attachment objects.
     * @param args.sendAsIntegration - Optional flag to send as integration.
     * @returns The created thread object.
     *
     * @example
     * ```typescript
     * const thread = await api.threads.createThread({
     *   channelId: 456,
     *   title: 'New Feature Discussion',
     *   content: 'Let\'s discuss the new feature...'
     * })
     * ```
     */
    async createThread(args: CreateThreadArgs): Promise<Thread> {
        const response = await request<Thread>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/add`,
            this.apiToken,
            args,
        )

        return ThreadSchema.parse(response.data)
    }

    /**
     * Updates a thread's properties.
     *
     * @param args - The arguments for updating a thread.
     * @param args.id - The thread ID.
     * @param args.title - Optional new thread title.
     * @param args.content - Optional new thread content.
     * @param args.recipients - Optional array of user IDs to notify.
     * @param args.attachments - Optional array of attachment objects.
     * @returns The updated thread object.
     */
    async updateThread(args: UpdateThreadArgs): Promise<Thread> {
        const response = await request<Thread>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/update`,
            this.apiToken,
            args,
        )

        return ThreadSchema.parse(response.data)
    }

    /**
     * Permanently deletes a thread.
     *
     * @param id - The thread ID.
     */
    async deleteThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/remove`, this.apiToken, {
            id,
        })
    }

    /**
     * Archives a thread.
     *
     * @param id - The thread ID.
     */
    async archiveThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/archive`, this.apiToken, {
            id,
        })
    }

    /**
     * Unarchives a thread.
     *
     * @param id - The thread ID.
     */
    async unarchiveThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/unarchive`, this.apiToken, {
            id,
        })
    }

    /**
     * Stars a thread.
     *
     * @param id - The thread ID.
     */
    async starThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/star`, this.apiToken, { id })
    }

    /**
     * Unstars a thread.
     *
     * @param id - The thread ID.
     */
    async unstarThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/unstar`, this.apiToken, {
            id,
        })
    }

    /**
     * Marks a thread as read.
     *
     * @param id - The thread ID.
     */
    async markRead(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/mark_read`, this.apiToken, {
            id,
        })
    }

    /**
     * Marks all threads in a workspace as read.
     *
     * @param workspaceId - The workspace ID.
     */
    async markAllRead(workspaceId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/mark_all_read`,
            this.apiToken,
            { workspace_id: workspaceId },
        )
    }

    /**
     * Clears unread status for a thread (marks as read without marking all comments as seen).
     *
     * @param id - The thread ID.
     */
    async clearUnread(id: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/clear_unread`,
            this.apiToken,
            { id },
        )
    }

    /**
     * Gets unread threads for a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @returns Array of unread thread IDs.
     */
    async getUnread(workspaceId: number): Promise<number[]> {
        const response = await request<number[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/get_unread`,
            this.apiToken,
            { workspace_id: workspaceId },
        )

        return response.data
    }
}
