import { ENDPOINT_GROUPS } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { Group, GroupSchema } from '../types/entities'
import { BaseClient } from './base-client'

export type AddGroupUserArgs = {
    id: number
    userId: number
}

export type AddGroupUsersArgs = {
    id: number
    userIds: number[]
}

export type RemoveGroupUserArgs = {
    id: number
    userId: number
}

export type RemoveGroupUsersArgs = {
    id: number
    userIds: number[]
}

/**
 * Client for interacting with Twist group endpoints.
 */
export class GroupsClient extends BaseClient {
    /**
     * Gets all groups for a given workspace.
     *
     * @param workspaceId - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns An array of group objects.
     *
     * @example
     * ```typescript
     * const groups = await api.groups.getGroups(123)
     * groups.forEach(g => console.log(g.name))
     * ```
     */
    getGroups(workspaceId: number, options: { batch: true }): BatchRequestDescriptor<Group[]>
    getGroups(workspaceId: number, options?: { batch?: false }): Promise<Group[]>
    getGroups(
        workspaceId: number,
        options?: { batch?: boolean },
    ): Promise<Group[]> | BatchRequestDescriptor<Group[]> {
        const method = 'GET'
        const url = `${ENDPOINT_GROUPS}/get`
        const params = { workspaceId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<Group[]>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => response.data.map((group) => GroupSchema.parse(group)),
        )
    }

    /**
     * Gets a single group object by id.
     *
     * @param id - The group ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The group object.
     */
    getGroup(id: number, options: { batch: true }): BatchRequestDescriptor<Group>
    getGroup(id: number, options?: { batch?: false }): Promise<Group>
    getGroup(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Group> | BatchRequestDescriptor<Group> {
        const method = 'GET'
        const url = `${ENDPOINT_GROUPS}/getone`
        const params = { id }
        const schema = GroupSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Group>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    createGroup(
        args: {
            workspaceId: number
            name: string
            description?: string
            color?: string
            userIds?: number[]
        },
        options: { batch: true },
    ): BatchRequestDescriptor<Group>
    createGroup(args: {
        workspaceId: number
        name: string
        description?: string
        color?: string
        userIds?: number[]
    }): Promise<Group>
    createGroup(
        args: {
            workspaceId: number
            name: string
            description?: string
            color?: string
            userIds?: number[]
        },
        options?: { batch?: boolean },
    ): Promise<Group> | BatchRequestDescriptor<Group> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/add`
        const params = args
        const schema = GroupSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Group>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Updates a group's properties.
     *
     * @param args - The arguments for updating a group.
     * @param args.id - The group ID.
     * @param args.name - Optional new group name.
     * @param args.description - Optional new group description.
     * @param args.color - Optional new group color.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated group object.
     */
    updateGroup(
        args: {
            id: number
            name?: string
            description?: string
            color?: string
        },
        options: { batch: true },
    ): BatchRequestDescriptor<Group>
    updateGroup(args: {
        id: number
        name?: string
        description?: string
        color?: string
    }): Promise<Group>
    updateGroup(
        args: {
            id: number
            name?: string
            description?: string
            color?: string
        },
        options?: { batch?: boolean },
    ): Promise<Group> | BatchRequestDescriptor<Group> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/update`
        const params = args
        const schema = GroupSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Group>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Permanently deletes a group.
     *
     * @param id - The group ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    deleteGroup(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    deleteGroup(id: number, options?: { batch?: false }): Promise<void>
    deleteGroup(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/remove`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }

    /**
     * Adds a user to a group.
     *
     * @param args - The arguments for adding a user.
     * @param args.id - The group ID.
     * @param args.userId - The user ID to add.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    addUserToGroup(args: AddGroupUserArgs, options: { batch: true }): BatchRequestDescriptor<void>
    addUserToGroup(args: AddGroupUserArgs, options?: { batch?: false }): Promise<void>
    addUserToGroup(
        args: AddGroupUserArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/add_user`
        const params = { id: args.id, userId: args.userId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }

    /**
     * Adds multiple users to a group.
     *
     * @param args - The arguments for adding users.
     * @param args.id - The group ID.
     * @param args.userIds - Array of user IDs to add.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.groups.addUsers({ id: 123, userIds: [456, 789, 101] })
     * ```
     */
    addUsers(args: AddGroupUsersArgs, options: { batch: true }): BatchRequestDescriptor<void>
    addUsers(args: AddGroupUsersArgs, options?: { batch?: false }): Promise<void>
    addUsers(
        args: AddGroupUsersArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/add_users`
        const params = { id: args.id, userIds: args.userIds }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }

    /**
     * Removes a user from a group.
     *
     * @param args - The arguments for removing a user.
     * @param args.id - The group ID.
     * @param args.userId - The user ID to remove.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    removeUser(args: RemoveGroupUserArgs, options: { batch: true }): BatchRequestDescriptor<void>
    removeUser(args: RemoveGroupUserArgs, options?: { batch?: false }): Promise<void>
    removeUser(
        args: RemoveGroupUserArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/remove_user`
        const params = { id: args.id, userId: args.userId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }

    /**
     * Removes multiple users from a group.
     *
     * @param args - The arguments for removing users.
     * @param args.id - The group ID.
     * @param args.userIds - Array of user IDs to remove.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    removeUsers(args: RemoveGroupUsersArgs, options: { batch: true }): BatchRequestDescriptor<void>
    removeUsers(args: RemoveGroupUsersArgs, options?: { batch?: false }): Promise<void>
    removeUsers(
        args: RemoveGroupUsersArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_GROUPS}/remove_users`
        const params = { id: args.id, userIds: args.userIds }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>(method, this.getBaseUri(), url, this.apiToken, params).then(
            () => undefined,
        )
    }
}
