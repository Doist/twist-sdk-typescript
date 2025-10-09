import { request } from '../rest-client'
import { BatchRequestDescriptor } from '../types/batch'
import { WorkspaceUser, WorkspaceUserSchema } from '../types/entities'
import { UserType } from '../types/enums'

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
     * Gets a user by id.
     *
     * @param workspaceId - The workspace ID.
     * @param userId - The user's ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The workspace user object or a batch request descriptor.
     *
     * @example
     * ```typescript
     * // Normal usage
     * const user = await api.workspaceUsers.getUserById(123, 456)
     * console.log(user.name, user.email)
     *
     * // Batch usage
     * const batch = api.createBatch()
     * batch.add((api) => api.workspaceUsers.getUserById(123, 456))
     * const results = await batch.execute()
     * ```
     */
    getUserById(workspaceId: number, userId: number, options: { batch: true }): BatchRequestDescriptor<WorkspaceUser>
    getUserById(workspaceId: number, userId: number, options?: { batch?: false }): Promise<WorkspaceUser>
    getUserById(
        workspaceId: number,
        userId: number,
        options?: { batch?: boolean },
    ): Promise<WorkspaceUser> | BatchRequestDescriptor<WorkspaceUser> {
        const method = 'GET'
        const url = 'workspace_users/getone'
        const params = { id: workspaceId, user_id: userId }
        const schema = WorkspaceUserSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<WorkspaceUser>(method, this.getBaseUri(), url, this.apiToken, params).then((response) =>
            schema.parse(response.data),
        )
    }

    /**
     * Gets a user by email.
     *
     * @param workspaceId - The workspace ID.
     * @param email - The user's email.
     * @returns The workspace user object.
     *
     * @example
     * ```typescript
     * const user = await api.workspaceUsers.getUserByEmail(123, 'user@example.com')
     * ```
     */
    async getUserByEmail(workspaceId: number, email: string): Promise<WorkspaceUser> {
        const response = await request<WorkspaceUser>(
            'GET',
            this.getBaseUri(),
            'workspace_users/get_by_email',
            this.apiToken,
            { id: workspaceId, email },
        )

        return WorkspaceUserSchema.parse(response.data)
    }

    /**
     * Gets the user's info in the context of the workspace.
     *
     * @param workspaceId - The workspace ID.
     * @param userId - The user's ID.
     * @returns Information about the user in the workspace context.
     */
    async getUserInfo(workspaceId: number, userId: number): Promise<Record<string, unknown>> {
        const response = await request<Record<string, unknown>>(
            'GET',
            this.getBaseUri(),
            'workspace_users/get_info',
            this.apiToken,
            { id: workspaceId, user_id: userId },
        )

        return response.data
    }

    /**
     * Gets the user's local time.
     *
     * @param workspaceId - The workspace ID.
     * @param userId - The user's ID.
     * @returns The user's local time as a string (e.g., "2017-05-10 07:55:40").
     *
     * @example
     * ```typescript
     * const localTime = await api.workspaceUsers.getUserLocalTime(123, 456)
     * console.log('User local time:', localTime)
     * ```
     */
    async getUserLocalTime(workspaceId: number, userId: number): Promise<string> {
        const response = await request<string>(
            'GET',
            this.getBaseUri(),
            'workspace_users/get_local_time',
            this.apiToken,
            { id: workspaceId, user_id: userId },
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
