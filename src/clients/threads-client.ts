import { request } from '../rest-client'
import { getTwistBaseUri, ENDPOINT_THREADS } from '../consts/endpoints'
import { Thread, ThreadSchema } from '../types/entities'
import { CreateThreadArgs, UpdateThreadArgs, GetThreadsArgs } from '../types/requests'

export class ThreadsClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    async getThreads(args: GetThreadsArgs): Promise<Thread[]> {
        const response = await request<Thread[]>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/get`,
            this.apiToken,
            args,
        )

        return response.data.map((thread) => ThreadSchema.parse(thread))
    }

    async getThread(id: number): Promise<Thread> {
        const response = await request<Thread>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/getone`,
            this.apiToken,
            { id },
        )

        return ThreadSchema.parse(response.data)
    }

    async createThread(args: CreateThreadArgs): Promise<Thread> {
        const response = await request<Thread>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/add`,
            this.apiToken,
            args,
        )

        return ThreadSchema.parse(response.data)
    }

    async updateThread(args: UpdateThreadArgs): Promise<Thread> {
        const response = await request<Thread>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_THREADS}/update`,
            this.apiToken,
            args,
        )

        return ThreadSchema.parse(response.data)
    }

    async deleteThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/remove`, this.apiToken, {
            id,
        })
    }

    async archiveThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/archive`, this.apiToken, {
            id,
        })
    }

    async unarchiveThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/unarchive`, this.apiToken, {
            id,
        })
    }

    async starThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/star`, this.apiToken, { id })
    }

    async unstarThread(id: number): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_THREADS}/unstar`, this.apiToken, {
            id,
        })
    }
}
