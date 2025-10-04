import { request } from '../rest-client'
import { getTwistBaseUri, ENDPOINT_GROUPS } from '../consts/endpoints'
import { Group, GroupSchema } from '../types/entities'

export class GroupsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    async getGroups(workspaceId: number): Promise<Group[]> {
        const response = await request<Group[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_GROUPS}/get`,
            this.apiToken,
            { workspaceId },
        )

        return response.data.map((group) => GroupSchema.parse(group))
    }

    async getGroup(id: number): Promise<Group> {
        const response = await request<Group>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_GROUPS}/getone`,
            this.apiToken,
            { id },
        )

        return GroupSchema.parse(response.data)
    }

    async createGroup(args: {
        workspaceId: number
        name: string
        description?: string
        color?: string
        userIds?: number[]
    }): Promise<Group> {
        const response = await request<Group>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_GROUPS}/add`,
            this.apiToken,
            args,
        )

        return GroupSchema.parse(response.data)
    }

    async updateGroup(args: {
        id: number
        name?: string
        description?: string
        color?: string
    }): Promise<Group> {
        const response = await request<Group>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_GROUPS}/update`,
            this.apiToken,
            args,
        )

        return GroupSchema.parse(response.data)
    }

    async deleteGroup(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_GROUPS}/remove`, this.apiToken, { id })
    }

    async addUserToGroup(id: number, userId: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_GROUPS}/add_user`, this.apiToken, {
            id,
            userId,
        })
    }
}
