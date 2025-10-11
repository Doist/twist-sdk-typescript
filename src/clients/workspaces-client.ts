import { ENDPOINT_WORKSPACES, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { Channel, ChannelSchema, Workspace, WorkspaceSchema } from '../types/entities'

/**
 * Client for interacting with Twist workspace endpoints.
 */
export class WorkspacesClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all the user's workspaces.
     *
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns An array of all workspaces the user belongs to.
     *
     * @example
     * ```typescript
     * const workspaces = await api.workspaces.getWorkspaces()
     * workspaces.forEach(ws => console.log(ws.name))
     * ```
     */
    getWorkspaces(options: { batch: true }): BatchRequestDescriptor<Workspace[]>
    getWorkspaces(options?: { batch?: false }): Promise<Workspace[]>
    getWorkspaces(options?: {
        batch?: boolean
    }): Promise<Workspace[]> | BatchRequestDescriptor<Workspace[]> {
        const method = 'GET'
        const url = `${ENDPOINT_WORKSPACES}/get`

        if (options?.batch) {
            return { method, url }
        }

        return request<Workspace[]>(method, this.getBaseUri(), url, this.apiToken).then(
            (response) => response.data.map((workspace) => WorkspaceSchema.parse(workspace)),
        )
    }

    /**
     * Gets a single workspace object by id.
     *
     * @param id - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.getWorkspace(123)
     * console.log(workspace.name)
     * ```
     */
    getWorkspace(id: number, options: { batch: true }): BatchRequestDescriptor<Workspace>
    getWorkspace(id: number, options?: { batch?: false }): Promise<Workspace>
    getWorkspace(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Workspace> | BatchRequestDescriptor<Workspace> {
        const method = 'GET'
        const url = `${ENDPOINT_WORKSPACES}/getone`
        const params = { id }
        const schema = WorkspaceSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Workspace>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Gets the user's default workspace.
     *
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The default workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.getDefaultWorkspace()
     * console.log(workspace.name)
     * ```
     */
    getDefaultWorkspace(options: { batch: true }): BatchRequestDescriptor<Workspace>
    getDefaultWorkspace(options?: { batch?: false }): Promise<Workspace>
    getDefaultWorkspace(options?: {
        batch?: boolean
    }): Promise<Workspace> | BatchRequestDescriptor<Workspace> {
        const method = 'GET'
        const url = `${ENDPOINT_WORKSPACES}/get_default`
        const schema = WorkspaceSchema

        if (options?.batch) {
            return { method, url, schema }
        }

        return request<Workspace>(method, this.getBaseUri(), url, this.apiToken).then((response) =>
            schema.parse(response.data),
        )
    }

    /**
     * Creates a new workspace.
     *
     * @param name - The name of the new workspace.
     * @param tempId - Optional temporary ID for the workspace.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The created workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.createWorkspace('My Team')
     * console.log('Created:', workspace.name)
     * ```
     */
    createWorkspace(
        name: string,
        tempId: number | undefined,
        options: { batch: true },
    ): BatchRequestDescriptor<Workspace>
    createWorkspace(name: string, tempId?: number, options?: { batch?: false }): Promise<Workspace>
    createWorkspace(
        name: string,
        tempId?: number,
        options?: { batch?: boolean },
    ): Promise<Workspace> | BatchRequestDescriptor<Workspace> {
        const params: Record<string, unknown> = { name }
        if (tempId !== undefined) params.tempId = tempId

        const method = 'POST'
        const url = `${ENDPOINT_WORKSPACES}/add`
        const schema = WorkspaceSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Workspace>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Updates an existing workspace.
     *
     * @param id - The workspace ID.
     * @param name - The new name for the workspace.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.updateWorkspace(123, 'New Team Name')
     * ```
     */
    updateWorkspace(
        id: number,
        name: string,
        options: { batch: true },
    ): BatchRequestDescriptor<Workspace>
    updateWorkspace(id: number, name: string, options?: { batch?: false }): Promise<Workspace>
    updateWorkspace(
        id: number,
        name: string,
        options?: { batch?: boolean },
    ): Promise<Workspace> | BatchRequestDescriptor<Workspace> {
        const method = 'POST'
        const url = `${ENDPOINT_WORKSPACES}/update`
        const params = { id, name }
        const schema = WorkspaceSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Workspace>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Removes a workspace and all its data (not recoverable).
     *
     * @param id - The workspace ID.
     * @param currentPassword - The user's current password for confirmation.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.workspaces.removeWorkspace(123, 'mypassword')
     * ```
     */
    removeWorkspace(
        id: number,
        currentPassword: string,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    removeWorkspace(id: number, currentPassword: string, options?: { batch?: false }): Promise<void>
    removeWorkspace(
        id: number,
        currentPassword: string,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_WORKSPACES}/remove`
        const params = { id, currentPassword }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }

    /**
     * Gets the public channels of a workspace.
     *
     * @param id - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns An array of public channel objects.
     *
     * @example
     * ```typescript
     * const channels = await api.workspaces.getPublicChannels(123)
     * channels.forEach(ch => console.log(ch.name))
     * ```
     */
    getPublicChannels(id: number, options: { batch: true }): BatchRequestDescriptor<Channel[]>
    getPublicChannels(id: number, options?: { batch?: false }): Promise<Channel[]>
    getPublicChannels(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Channel[]> | BatchRequestDescriptor<Channel[]> {
        const method = 'GET'
        const url = `${ENDPOINT_WORKSPACES}/get_public_channels`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<Channel[]>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => response.data.map((channel) => ChannelSchema.parse(channel)),
        )
    }
}
