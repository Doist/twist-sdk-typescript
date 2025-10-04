import { request } from '../rest-client'
import { WorkspaceUser, WorkspaceUserSchema } from '../types/entities'
import { UserType } from '../types/enums'

export class WorkspaceUsersClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v4` : 'https://api.twist.com/api/v4/'
    }

    async getWorkspaceUsers(workspaceId: number, archived?: boolean): Promise<WorkspaceUser[]> {
        const response = await request<WorkspaceUser[]>(
            'GET',
            this.getBaseUri(),
            'workspace_users/get',
            this.apiToken,
            { id: workspaceId, archived },
        )

        return response.data.map((user) => WorkspaceUserSchema.parse(user))
    }

    async getWorkspaceUserIds(workspaceId: number): Promise<number[]> {
        const response = await request<number[]>(
            'GET',
            this.getBaseUri(),
            'workspace_users/get_ids',
            this.apiToken,
            { id: workspaceId },
        )

        return response.data
    }

    async addUser(args: {
        workspaceId: number
        email: string
        name?: string
        userType?: UserType
        channelIds?: number[]
    }): Promise<WorkspaceUser> {
        const response = await request<WorkspaceUser>(
            'POST',
            this.getBaseUri(),
            'workspace_users/add',
            this.apiToken,
            {
                id: args.workspaceId,
                email: args.email,
                name: args.name,
                userType: args.userType,
                channelIds: args.channelIds,
            },
        )

        return WorkspaceUserSchema.parse(response.data)
    }

    async updateUser(args: {
        workspaceId: number
        userType: UserType
        email?: string
        userId?: number
    }): Promise<WorkspaceUser> {
        const response = await request<WorkspaceUser>(
            'POST',
            this.getBaseUri(),
            'workspace_users/update',
            this.apiToken,
            {
                id: args.workspaceId,
                userType: args.userType,
                email: args.email,
                userId: args.userId,
            },
        )

        return WorkspaceUserSchema.parse(response.data)
    }

    async removeUser(args: {
        workspaceId: number
        email?: string
        userId?: number
    }): Promise<void> {
        await request('POST', this.getBaseUri(), 'workspace_users/remove', this.apiToken, {
            id: args.workspaceId,
            email: args.email,
            userId: args.userId,
        })
    }

    async resendInvite(args: {
        workspaceId: number
        email: string
        userId?: number
    }): Promise<void> {
        await request('POST', this.getBaseUri(), 'workspace_users/resend_invite', this.apiToken, {
            id: args.workspaceId,
            email: args.email,
            userId: args.userId,
        })
    }
}
