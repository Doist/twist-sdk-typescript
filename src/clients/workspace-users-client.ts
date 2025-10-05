import { request } from '../rest-client.js'
import { WorkspaceUser, WorkspaceUserSchema } from '../types/entities.js'
import { UserType } from '../types/enums.js'

/**
 * Client for interacting with Twist workspace users endpoints (v4 API).
 */
export class WorkspaceUsersClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v4` : 'https://api.twist.com/api/v4/'
    }

    /**
     * Returns a list of workspace user objects for the given workspace id.
     *
     * @param workspaceId - The workspace ID.
     * @param archived - Optional flag to filter archived users.
     * @returns An array of workspace user objects.
     *
     * @example
     * ```typescript
     * const users = await api.workspaceUsers.getWorkspaceUsers(123)
     * users.forEach(u => console.log(u.name, u.userType))
     * ```
     */
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

    /**
     * Returns a list of workspace user IDs for the given workspace id.
     *
     * @param workspaceId - The workspace ID.
     * @returns An array of user IDs.
     */
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

    /**
     * Adds a person to a workspace.
     *
     * @param args - The arguments for adding a user.
     * @param args.workspaceId - The workspace ID.
     * @param args.email - The user's email.
     * @param args.name - Optional name for the user.
     * @param args.userType - Optional user type (USER, GUEST, or ADMIN).
     * @param args.channelIds - Optional array of channel IDs to add the user to.
     * @returns The created workspace user object.
     */
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

    /**
     * Updates a person in a workspace.
     *
     * @param args - The arguments for updating a user.
     * @param args.workspaceId - The workspace ID.
     * @param args.userType - The user type (USER, GUEST, or ADMIN).
     * @param args.email - Optional email of the user to update.
     * @param args.userId - Optional user ID to update (use either email or userId).
     * @returns The updated workspace user object.
     */
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

    /**
     * Removes a person from a workspace.
     *
     * @param args - The arguments for removing a user.
     * @param args.workspaceId - The workspace ID.
     * @param args.email - Optional email of the user to remove.
     * @param args.userId - Optional user ID to remove (use either email or userId).
     */
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

    /**
     * Sends a new workspace invitation to the selected user.
     *
     * @param args - The arguments for resending an invite.
     * @param args.workspaceId - The workspace ID.
     * @param args.email - The user's email.
     * @param args.userId - Optional user ID.
     */
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
