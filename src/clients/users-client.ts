import { ENDPOINT_USERS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { User, UserSchema } from '../types/entities'

export class UsersClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    async getSessionUser(): Promise<User> {
        const response = await request<User>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/get_session_user`,
            this.apiToken,
        )

        return UserSchema.parse(response.data)
    }
}
