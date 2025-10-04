import { ENDPOINT_CHANNELS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Channel, ChannelSchema } from '../types/entities'
import { CreateChannelArgs, GetChannelsArgs, UpdateChannelArgs } from '../types/requests'

/**
 * Client for interacting with Twist channel endpoints.
 */
export class ChannelsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets all channels for a given workspace.
     *
     * @param args - The arguments for getting channels.
     * @param args.workspaceId - The workspace ID.
     * @param args.archived - Optional flag to include archived channels.
     * @returns An array of channel objects.
     *
     * @example
     * ```typescript
     * const channels = await api.channels.getChannels({ workspaceId: 123 })
     * channels.forEach(ch => console.log(ch.name))
     * ```
     */
    async getChannels(args: GetChannelsArgs): Promise<Channel[]> {
        const response = await request<Channel[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CHANNELS}/get`,
            this.apiToken,
            args,
        )

        return response.data.map((channel) => ChannelSchema.parse(channel))
    }

    /**
     * Gets a single channel object by id.
     *
     * @param id - The channel ID.
     * @returns The channel object.
     */
    async getChannel(id: number): Promise<Channel> {
        const response = await request<Channel>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_CHANNELS}/getone`,
            this.apiToken,
            { id },
        )

        return ChannelSchema.parse(response.data)
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
    async createChannel(args: CreateChannelArgs): Promise<Channel> {
        const response = await request<Channel>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CHANNELS}/add`,
            this.apiToken,
            args,
        )

        return ChannelSchema.parse(response.data)
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
     * @returns The updated channel object.
     */
    async updateChannel(args: UpdateChannelArgs): Promise<Channel> {
        const response = await request<Channel>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_CHANNELS}/update`,
            this.apiToken,
            args,
        )

        return ChannelSchema.parse(response.data)
    }

    /**
     * Permanently deletes a channel.
     *
     * @param id - The channel ID.
     */
    async deleteChannel(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_CHANNELS}/remove`, this.apiToken, {
            id,
        })
    }

    /**
     * Archives a channel.
     *
     * @param id - The channel ID.
     */
    async archiveChannel(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_CHANNELS}/archive`, this.apiToken, {
            id,
        })
    }

    /**
     * Unarchives a channel.
     *
     * @param id - The channel ID.
     */
    async unarchiveChannel(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_CHANNELS}/unarchive`, this.apiToken, {
            id,
        })
    }
}
