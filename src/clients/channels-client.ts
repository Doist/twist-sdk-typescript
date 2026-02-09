import { z } from 'zod'
import { ENDPOINT_CHANNELS } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
import { Channel, ChannelSchema } from '../types/entities'
import { CreateChannelArgs, GetChannelsArgs, UpdateChannelArgs } from '../types/requests'
import { BaseClient } from './base-client'

export type AddChannelUserArgs = {
    id: number
    userId: number
}

export type AddChannelUsersArgs = {
    id: number
    userIds: number[]
}

export type RemoveChannelUserArgs = {
    id: number
    userId: number
}

export type RemoveChannelUsersArgs = {
    id: number
    userIds: number[]
}

/**
 * Client for interacting with Twist channel endpoints.
 */
export class ChannelsClient extends BaseClient {
    /**
     * Gets all channels for a given workspace.
     *
     * @param args - The arguments for getting channels.
     * @param args.workspaceId - The workspace ID.
     * @param args.archived - Optional flag to include archived channels.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns An array of channel objects.
     *
     * @example
     * ```typescript
     * const channels = await api.channels.getChannels({ workspaceId: 123 })
     * channels.forEach(ch => console.log(ch.name))
     * ```
     */
    getChannels(args: GetChannelsArgs, options: { batch: true }): BatchRequestDescriptor<Channel[]>
    getChannels(args: GetChannelsArgs, options?: { batch?: false }): Promise<Channel[]>
    getChannels(
        args: GetChannelsArgs,
        options?: { batch?: boolean },
    ): Promise<Channel[]> | BatchRequestDescriptor<Channel[]> {
        const method = 'GET'
        const url = `${ENDPOINT_CHANNELS}/get`
        const params = args

        if (options?.batch) {
            return { method, url, params, schema: z.array(ChannelSchema) }
        }

        return request<Channel[]>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => response.data.map((channel) => ChannelSchema.parse(channel)))
    }

    /**
     * Gets a single channel object by id.
     *
     * @param id - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The channel object.
     */
    getChannel(id: number, options: { batch: true }): BatchRequestDescriptor<Channel>
    getChannel(id: number, options?: { batch?: false }): Promise<Channel>
    getChannel(
        id: number,
        options?: { batch?: boolean },
    ): Promise<Channel> | BatchRequestDescriptor<Channel> {
        const method = 'GET'
        const url = `${ENDPOINT_CHANNELS}/getone`
        const params = { id }
        const schema = ChannelSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Channel>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Creates a new channel.
     *
     * @param args - The arguments for creating a channel.
     * @param args.workspaceId - The workspace ID.
     * @param args.name - The channel name.
     * @param args.description - Optional channel description.
     * @param args.color - Optional channel color.
     * @param args.userIds - Optional array of user IDs to add to the channel.
     * @param args.public - Optional flag to make the channel public.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The created channel object.
     *
     * @example
     * ```typescript
     * const channel = await api.channels.createChannel({
     *   workspaceId: 123,
     *   name: 'Engineering',
     *   description: 'Engineering team channel'
     * })
     * ```
     */
    createChannel(
        args: CreateChannelArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Channel>
    createChannel(args: CreateChannelArgs, options?: { batch?: false }): Promise<Channel>
    createChannel(
        args: CreateChannelArgs,
        options?: { batch?: boolean },
    ): Promise<Channel> | BatchRequestDescriptor<Channel> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/add`
        const params = args
        const schema = ChannelSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Channel>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Updates a channel's properties.
     *
     * @param args - The arguments for updating a channel.
     * @param args.id - The channel ID.
     * @param args.name - Optional new channel name.
     * @param args.description - Optional new channel description.
     * @param args.color - Optional new channel color.
     * @param args.public - Optional flag to change channel visibility.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated channel object.
     */
    updateChannel(
        args: UpdateChannelArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<Channel>
    updateChannel(args: UpdateChannelArgs, options?: { batch?: false }): Promise<Channel>
    updateChannel(
        args: UpdateChannelArgs,
        options?: { batch?: boolean },
    ): Promise<Channel> | BatchRequestDescriptor<Channel> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/update`
        const params = args
        const schema = ChannelSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<Channel>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then((response) => schema.parse(response.data))
    }

    /**
     * Permanently deletes a channel.
     *
     * @param id - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    deleteChannel(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    deleteChannel(id: number, options?: { batch?: false }): Promise<void>
    deleteChannel(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/remove`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Archives a channel.
     *
     * @param id - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    archiveChannel(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    archiveChannel(id: number, options?: { batch?: false }): Promise<void>
    archiveChannel(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/archive`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Unarchives a channel.
     *
     * @param id - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    unarchiveChannel(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    unarchiveChannel(id: number, options?: { batch?: false }): Promise<void>
    unarchiveChannel(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/unarchive`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Favorites a channel.
     *
     * @param id - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    favoriteChannel(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    favoriteChannel(id: number, options?: { batch?: false }): Promise<void>
    favoriteChannel(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/favorite`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Unfavorites a channel.
     *
     * @param id - The channel ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    unfavoriteChannel(id: number, options: { batch: true }): BatchRequestDescriptor<void>
    unfavoriteChannel(id: number, options?: { batch?: false }): Promise<void>
    unfavoriteChannel(
        id: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/unfavorite`
        const params = { id }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Adds a user to a channel.
     *
     * @param args - The arguments for adding a user.
     * @param args.id - The channel ID.
     * @param args.userId - The user ID to add.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.channels.addUser({ id: 456, userId: 789 })
     * ```
     */
    addUser(args: AddChannelUserArgs, options: { batch: true }): BatchRequestDescriptor<void>
    addUser(args: AddChannelUserArgs, options?: { batch?: false }): Promise<void>
    addUser(
        args: AddChannelUserArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/add_user`
        const params = { id: args.id, userId: args.userId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Adds multiple users to a channel.
     *
     * @param args - The arguments for adding users.
     * @param args.id - The channel ID.
     * @param args.userIds - Array of user IDs to add.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.channels.addUsers({ id: 456, userIds: [789, 790, 791] })
     * ```
     */
    addUsers(args: AddChannelUsersArgs, options: { batch: true }): BatchRequestDescriptor<void>
    addUsers(args: AddChannelUsersArgs, options?: { batch?: false }): Promise<void>
    addUsers(
        args: AddChannelUsersArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/add_users`
        const params = { id: args.id, userIds: args.userIds }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Removes a user from a channel.
     *
     * @param args - The arguments for removing a user.
     * @param args.id - The channel ID.
     * @param args.userId - The user ID to remove.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    removeUser(args: RemoveChannelUserArgs, options: { batch: true }): BatchRequestDescriptor<void>
    removeUser(args: RemoveChannelUserArgs, options?: { batch?: false }): Promise<void>
    removeUser(
        args: RemoveChannelUserArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/remove_user`
        const params = { id: args.id, userId: args.userId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }

    /**
     * Removes multiple users from a channel.
     *
     * @param args - The arguments for removing users.
     * @param args.id - The channel ID.
     * @param args.userIds - Array of user IDs to remove.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    removeUsers(
        args: RemoveChannelUsersArgs,
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    removeUsers(args: RemoveChannelUsersArgs, options?: { batch?: false }): Promise<void>
    removeUsers(
        args: RemoveChannelUsersArgs,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_CHANNELS}/remove_users`
        const params = { id: args.id, userIds: args.userIds }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<void>({
            httpMethod: method,
            baseUri: this.getBaseUri(),
            relativePath: url,
            apiToken: this.apiToken,
            payload: params,
            customFetch: this.customFetch,
        }).then(() => undefined)
    }
}
