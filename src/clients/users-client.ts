import { ENDPOINT_USERS, getTwistBaseUri } from '../consts/endpoints.js'
import { request } from '../rest-client.js'
import { User, UserSchema } from '../types/entities.js'

/**
 * Client for interacting with Twist user endpoints.
 */
export class UsersClient {
    constructor(
        private apiToken: string,
        private baseUrl?: string,
    ) {}

    private getBaseUri(): string {
        return this.baseUrl ? `${this.baseUrl}/api/v3` : getTwistBaseUri()
    }

    /**
     * Gets the associated user for the access token used in the request.
     *
     * @returns The authenticated user's information.
     *
     * @example
     * ```typescript
     * const user = await api.users.getSessionUser()
     * console.log(user.name, user.email)
     * ```
     */
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
