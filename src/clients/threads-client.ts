import { ENDPOINT_THREADS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns An array of thread objects.
     *
     * @example
     * ```typescript
     * const threads = await api.threads.getThreads({ channelId: 456 })
     * threads.forEach(t => console.log(t.title))
     * ```
     */
    getThreads(args: GetThreadsArgs, options: { batch: true }): BatchRequestDescriptor<Thread[]>
    getThreads(args: GetThreadsArgs, options?: { batch?: false }): Promise<Thread[]>
    getThreads(
        args: GetThreadsArgs,
        options?: { batch?: boolean },
    ): Promise<Thread[]> | BatchRequestDescriptor<Thread[]> {
        const method = 'GET'
        const url = `${ENDPOINT_THREADS}/get`
        const params = args

        if (options?.batch) {
            return { method, url, params }
        }

        return request<Thread[]>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => response.data.map((thread) => ThreadSchema.parse(thread)),
        )
    }

    /**
     * Gets a single thread object by id.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The thread object.
     */
    getThread(id: number, options: { batch: true }): BatchRequestDescriptor<Thread>
    getThread(id: number, options?: { batch?: false }): Promise<Thread>
    getThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Thread> | BatchRequestDescriptor<Thread> {
        const method = 'GET'
        const url = `${ENDPOINT_THREADS}/getone`
        const params = { id }
        const schema = ThreadSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Thread>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    createThread(args: CreateThreadArgs, options: { batch: true }): BatchRequestDescriptor<Thread>
    createThread(args: CreateThreadArgs, options?: { batch?: false }): Promise<Thread>
    createThread(
        args: CreateThreadArgs,
        options?: { batch?: boolean },
    ): Promise<Thread> | BatchRequestDescriptor<Thread> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/add`
        const params = args
        const schema = ThreadSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Thread>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated thread object.
     */
    updateThread(args: UpdateThreadArgs, options: { batch: true }): BatchRequestDescriptor<Thread>
    updateThread(args: UpdateThreadArgs, options?: { batch?: false }): Promise<Thread>
    updateThread(
        args: UpdateThreadArgs,
        options?: { batch?: boolean },
    ): Promise<Thread> | BatchRequestDescriptor<Thread> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/update`
        const params = args
        const schema = ThreadSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Thread>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Permanently deletes a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    deleteThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    deleteThread(id: number, options?: { batch?: false }): Promise<void>
    deleteThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/remove`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Archives a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    archiveThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    archiveThread(id: number, options?: { batch?: false }): Promise<void>
    archiveThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/archive`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Unarchives a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    unarchiveThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    unarchiveThread(id: number, options?: { batch?: false }): Promise<void>
    unarchiveThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/unarchive`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Stars a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    starThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    starThread(id: number, options?: { batch?: false }): Promise<void>
    starThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/star`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Unstars a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    unstarThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    unstarThread(id: number, options?: { batch?: false }): Promise<void>
    unstarThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/unstar`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Pins a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    pinThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    pinThread(id: number, options?: { batch?: false }): Promise<void>
    pinThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/pin`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Unpins a thread.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    unpinThread(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    unpinThread(id: number, options?: { batch?: false }): Promise<void>
    unpinThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/unpin`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Moves a thread to a different channel.
     *
     * @param id - The thread ID.
     * @param toChannel - The target channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    moveToChannel(
        id: number,
        toChannel: number,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    moveToChannel(id: number, toChannel: number, options?: { batch?: false }): Promise<void>
    moveToChannel(
        id: number,
        toChannel: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/move_to_channel`
        const params = { id, toChannel }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Marks a thread as read.
     *
     * @param id - The thread ID.
     * @param objIndex - The index of the last known read message.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    markRead(id: number, objIndex: number, options: { batch: true }): BatchRequestDescriptor<void>
    markRead(id: number, objIndex: number, options?: { batch?: false }): Promise<void>
    markRead(
        id: number,
        objIndex: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/mark_read`
        const params = { id, obj_index: objIndex }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Marks a thread as unread.
     *
     * @param id - The thread ID.
     * @param objIndex - The index of the last unread message. Use -1 to mark the whole thread as unread.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    markUnread(id: number, objIndex: number, options: { batch: true }): BatchRequestDescriptor<void>
    markUnread(id: number, objIndex: number, options?: { batch?: false }): Promise<void>
    markUnread(
        id: number,
        objIndex: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/mark_unread`
        const params = { id, obj_index: objIndex }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Marks a thread as unread for others. Useful to notify others about thread changes.
     *
     * @param id - The thread ID.
     * @param objIndex - The index of the last unread message. Use -1 to mark the whole thread as unread.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    markUnreadForOthers(
        id: number,
        objIndex: number,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    markUnreadForOthers(id: number, objIndex: number, options?: { batch?: false }): Promise<void>
    markUnreadForOthers(
        id: number,
        objIndex: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/mark_unread_for_others`
        const params = { id, obj_index: objIndex }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Marks all threads as read in a workspace or channel.
     *
     * @param args - Either workspaceId or channelId (one is required).
     * @param args.workspaceId - The workspace ID.
     * @param args.channelId - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    markAllRead(
        args: { workspaceId?: number; channelId?: number },
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    markAllRead(
        args: { workspaceId?: number; channelId?: number },
        options?: { batch?: false },
    ): Promise<void>
    markAllRead(
        args: { workspaceId?: number; channelId?: number },
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        if (!args.workspaceId && !args.channelId) {
            throw new Error('Either workspaceId or channelId is required')
        }

        const params: Record<string, number> = {}
        if (args.workspaceId) params.workspace_id = args.workspaceId
        if (args.channelId) params.channel_id = args.channelId

        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/mark_all_read`

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Clears unread threads in a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    clearUnread(workspaceId: number, options: { batch: true }): BatchRequestDescriptor<void>
    clearUnread(workspaceId: number, options?: { batch?: false }): Promise<void>
    clearUnread(
        workspaceId: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/clear_unread`
        const params = { workspace_id: workspaceId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Gets unread threads for a workspace.
     *
     * @param workspaceId - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns Array of unread thread references.
     */
    getUnread(workspaceId: number, options: { batch: true }): BatchRequestDescriptor<UnreadThread[]>
    getUnread(workspaceId: number, options?: { batch?: false }): Promise<UnreadThread[]>
    getUnread(
        workspaceId: number,
        options?: { batch?: boolean },
    ): Promise<UnreadThread[]> | BatchRequestDescriptor<UnreadThread[]> {
        const method = 'GET'
        const url = `${ENDPOINT_THREADS}/get_unread`
        const params = { workspace_id: workspaceId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<UnreadThread[]>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => response.data.map((thread) => UnreadThreadSchema.parse(thread)),
        )
    }

    /**
     * Mutes a thread for a specified number of minutes.
     * When muted, you will not get notified in your inbox about new comments.
     *
     * @param id - The thread ID.
     * @param minutes - Number of minutes to mute the thread.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated thread object.
     *
     * @example
     * ```typescript
     * const thread = await api.threads.muteThread(789, 30)
     * ```
     */
    muteThread(
        id: number,
        minutes: number,
        options: { batch: true },
    ): BatchRequestDescriptor<Thread>
    muteThread(id: number, minutes: number, options?: { batch?: false }): Promise<Thread>
    muteThread(
        id: number,
        minutes: number,
        options?: { batch?: boolean },
    ): Promise<Thread> | BatchRequestDescriptor<Thread> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/mute`
        const params = { id, minutes }
        const schema = ThreadSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Thread>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Unmutes a thread.
     * You will start to see notifications in your inbox again when new comments are added.
     *
     * @param id - The thread ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated thread object.
     */
    unmuteThread(id: number, options: { batch: true }): BatchRequestDescriptor<Thread>
    unmuteThread(id: number, options?: { batch?: false }): Promise<Thread>
    unmuteThread(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Thread> | BatchRequestDescriptor<Thread> {
        const method = 'POST'
        const url = `${ENDPOINT_THREADS}/unmute`
        const params = { id }
        const schema = ThreadSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Thread>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }
}
