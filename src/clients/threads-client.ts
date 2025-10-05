import { ENDPOINT_THREADS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Thread, ThreadSchema, UnreadThread, UnreadThreadSchema } from '../types/entities'
import { CreateThreadArgs, GetThreadsArgs, UpdateThreadArgs } from '../types/requests'

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
     * Pins a thread.
     *
     * @param id - The thread ID.
     */
    async pinThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/pin`, this.apiToken, { id })
    }

    /**
     * Unpins a thread.
     *
     * @param id - The thread ID.
     */
    async unpinThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/unpin`, this.apiToken, {
            id,
        })
    }

    /**
     * Moves a thread to a different channel.
     *
     * @param id - The thread ID.
     * @param toChannel - The target channel ID.
     */
    async moveToChannel(id: number, toChannel: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/move_to_channel`,
            this.apiToken,
            { id, toChannel },
        )
    }

    /**
     * Marks a thread as read.
     *
     * @param id - The thread ID.
     * @param objIndex - The index of the last known read message.
     */
    async markRead(id: number, objIndex: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/mark_read`, this.apiToken, {
            id,
            obj_index: objIndex,
        })
    }

    /**
     * Marks a thread as unread.
     *
     * @param id - The thread ID.
     * @param objIndex - The index of the last unread message. Use -1 to mark the whole thread as unread.
     */
    async markUnread(id: number, objIndex: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/mark_unread`, this.apiToken, {
            id,
            obj_index: objIndex,
        })
    }

    /**
     * Marks a thread as unread for others. Useful to notify others about thread changes.
     *
     * @param id - The thread ID.
     * @param objIndex - The index of the last unread message. Use -1 to mark the whole thread as unread.
     */
    async markUnreadForOthers(id: number, objIndex: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/mark_unread_for_others`,
            this.apiToken,
            { id, obj_index: objIndex },
        )
    }

    /**
     * Marks all threads as read in a workspace or channel.
     *
     * @param args - Either workspaceId or channelId (one is required).
     * @param args.workspaceId - The workspace ID.
     * @param args.channelId - The channel ID.
     *
     * @example
     * ```typescript
     * // Mark all in workspace
     * await api.threads.markAllRead({ workspaceId: 123 })
     *
     * // Mark all in channel
     * await api.threads.markAllRead({ channelId: 456 })
     * ```
     */
    async markAllRead(args: { workspaceId?: number; channelId?: number }): Promise<void> {
        if (!args.workspaceId && !args.channelId) {
            throw new Error('Either workspaceId or channelId is required')
        }

        const params: Record<string, number> = {}
        if (args.workspaceId) params.workspace_id = args.workspaceId
        if (args.channelId) params.channel_id = args.channelId

        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/mark_all_read`,
            this.apiToken,
            params,
        )
    }

    /**
     * Clears unread threads in a workspace.
     *
     * @param workspaceId - The workspace ID.
     */
    async clearUnread(workspaceId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/clear_unread`,
            this.apiToken,
            { workspace_id: workspaceId },
        )
    }

    /**
     * Gets unread threads for a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @returns Array of unread thread references.
     */
    async getUnread(workspaceId: number): Promise<UnreadThread[]> {
        const response = await request<UnreadThread[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/get_unread`,
            this.apiToken,
            { workspace_id: workspaceId },
        )

        return response.data.map((thread) => UnreadThreadSchema.parse(thread))
    }

    /**
     * Mutes a thread for a specified number of minutes.
     * When muted, you will not get notified in your inbox about new comments.
     *
     * @param id - The thread ID.
     * @param minutes - Number of minutes to mute the thread.
     * @returns The updated thread object.
     *
     * @example
     * ```typescript
     * const thread = await api.threads.muteThread(789, 30)
     * ```
     */
    async muteThread(id: number, minutes: number): Promise<Thread> {
        const response = await request<Thread>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/mute`,
            this.apiToken,
            { id, minutes },
        )

        return ThreadSchema.parse(response.data)
    }

    /**
     * Unmutes a thread.
     * You will start to see notifications in your inbox again when new comments are added.
     *
     * @param id - The thread ID.
     * @returns The updated thread object.
     */
    async unmuteThread(id: number): Promise<Thread> {
        const response = await request<Thread>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/unmute`,
            this.apiToken,
            { id },
        )

        return ThreadSchema.parse(response.data)
    }
}
