import { ENDPOINT_WORKSPACES, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Workspace, WorkspaceSchema } from '../types/entities'

export class WorkspacesClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    async getWorkspaces(): Promise<Workspace[]> {
        const response = await request<Workspace[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_WORKSPACES}/get`,
            this.apiToken,
        )

        return response.data.map((workspace) => WorkspaceSchema.parse(workspace))
    }

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
