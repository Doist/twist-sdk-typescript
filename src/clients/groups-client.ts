import { ENDPOINT_GROUPS, getTwistBaseUri } from '../consts/endpoints.js'
import { request } from '../rest-client.js'
import { Group, GroupSchema } from '../types/entities.js'

/**
 * Client for interacting with Twist group endpoints.
 */
export class GroupsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all groups for a given workspace.
     *
     * @param workspaceId - The workspace ID.
     * @returns An array of group objects.
     *
     * @example
     * ```typescript
     * const groups = await api.groups.getGroups(123)
     * groups.forEach(g => console.log(g.name))
     * ```
     */
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

    /**
     * Gets a single group object by id.
     *
     * @param id - The group ID.
     * @returns The group object.
     */
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

    /**
     * Creates a new group.
     *
     * @param args - The arguments for creating a group.
     * @param args.workspaceId - The workspace ID.
     * @param args.name - The group name.
     * @param args.description - Optional group description.
     * @param args.color - Optional group color.
     * @param args.userIds - Optional array of user IDs to add to the group.
     * @returns The created group object.
     *
     * @example
     * ```typescript
     * const group = await api.groups.createGroup({
     *   workspaceId: 123,
     *   name: 'Engineering Team',
     *   userIds: [1, 2, 3]
     * })
     * ```
     */
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

    /**
     * Updates a group's properties.
     *
     * @param args - The arguments for updating a group.
     * @param args.id - The group ID.
     * @param args.name - Optional new group name.
     * @param args.description - Optional new group description.
     * @param args.color - Optional new group color.
     * @returns The updated group object.
     */
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

    /**
     * Permanently deletes a group.
     *
     * @param id - The group ID.
     */
    async deleteGroup(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_GROUPS}/remove`, this.apiToken, { id })
    }

    /**
     * Adds a user to a group.
     *
     * @param id - The group ID.
     * @param userId - The user ID to add.
     */
    async addUserToGroup(id: number, userId: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_GROUPS}/add_user`, this.apiToken, {
            id,
            userId,
        })
    }
}
