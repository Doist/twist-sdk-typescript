import { ENDPOINT_WORKSPACES, getTwistBaseUri } from '../consts/endpoints.js'
import { request } from '../rest-client.js'
import { Workspace, WorkspaceSchema } from '../types/entities.js'

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
}
