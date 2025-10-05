import { ENDPOINT_WORKSPACES, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
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
     * @returns An array of all workspaces the user belongs to.
     *
     * @example
     * ```typescript
     * const workspaces = await api.workspaces.getWorkspaces()
     * workspaces.forEach(ws => console.log(ws.name))
     * ```
     */
    async getWorkspaces(): Promise<Workspace[]> {
        const response = await request<Workspace[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/get`,
            this.apiToken,
        )

        return response.data.map((workspace) => WorkspaceSchema.parse(workspace))
    }

    /**
     * Gets a single workspace object by id.
     *
     * @param id - The workspace ID.
     * @returns The workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.getWorkspace(123)
     * console.log(workspace.name)
     * ```
     */
    async getWorkspace(id: number): Promise<Workspace> {
        const response = await request<Workspace>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/getone`,
            this.apiToken,
            { id },
        )

        return WorkspaceSchema.parse(response.data)
    }

    /**
     * Gets the user's default workspace.
     *
     * @returns The default workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.getDefaultWorkspace()
     * console.log(workspace.name)
     * ```
     */
    async getDefaultWorkspace(): Promise<Workspace> {
        const response = await request<Workspace>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/get_default`,
            this.apiToken,
        )

        return WorkspaceSchema.parse(response.data)
    }

    /**
     * Creates a new workspace.
     *
     * @param name - The name of the new workspace.
     * @param tempId - Optional temporary ID for the workspace.
     * @returns The created workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.createWorkspace('My Team')
     * console.log('Created:', workspace.name)
     * ```
     */
    async createWorkspace(name: string, tempId?: number): Promise<Workspace> {
        const params: Record<string, unknown> = { name }
        if (tempId !== undefined) params.tempId = tempId

        const response = await request<Workspace>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/add`,
            this.apiToken,
            params,
        )

        return WorkspaceSchema.parse(response.data)
    }

    /**
     * Updates an existing workspace.
     *
     * @param id - The workspace ID.
     * @param name - The new name for the workspace.
     * @returns The updated workspace object.
     *
     * @example
     * ```typescript
     * const workspace = await api.workspaces.updateWorkspace(123, 'New Team Name')
     * ```
     */
    async updateWorkspace(id: number, name: string): Promise<Workspace> {
        const response = await request<Workspace>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/update`,
            this.apiToken,
            { id, name },
        )

        return WorkspaceSchema.parse(response.data)
    }

    /**
     * Removes a workspace and all its data (not recoverable).
     *
     * @param id - The workspace ID.
     * @param currentPassword - The user's current password for confirmation.
     *
     * @example
     * ```typescript
     * await api.workspaces.removeWorkspace(123, 'mypassword')
     * ```
     */
    async removeWorkspace(id: number, currentPassword: string): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_WORKSPACES}/remove`, this.apiToken, {
            id,
            currentPassword,
        })
    }

    /**
     * Gets the public channels of a workspace.
     *
     * @param id - The workspace ID.
     * @returns An array of public channel objects.
     *
     * @example
     * ```typescript
     * const channels = await api.workspaces.getPublicChannels(123)
     * channels.forEach(ch => console.log(ch.name))
     * ```
     */
    async getPublicChannels(id: number): Promise<Channel[]> {
        const response = await request<Channel[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/get_public_channels`,
            this.apiToken,
            { id },
        )

        return response.data.map((channel) => ChannelSchema.parse(channel))
    }
}
