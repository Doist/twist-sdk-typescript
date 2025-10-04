import { ENDPOINT_CHANNELS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { Channel, ChannelSchema } from '../types/entities'
import { CreateChannelArgs, GetChannelsArgs, UpdateChannelArgs } from '../types/requests'

export class ChannelsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

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

    async deleteChannel(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_CHANNELS}/remove`, this.apiToken, {
            id,
        })
    }

    async archiveChannel(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_CHANNELS}/archive`, this.apiToken, {
            id,
        })
    }

    async unarchiveChannel(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_CHANNELS}/unarchive`, this.apiToken, {
            id,
        })
    }
}
