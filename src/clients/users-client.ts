import { ENDPOINT_USERS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import { User, UserSchema } from '../types/entities'

type AwayMode = {
    type: 'parental' | 'vacation' | 'sickleave' | 'other'
    dateFrom?: string
    dateTo: string
}

type UpdateUserArgs = {
    name?: string
    email?: string
    password?: string
    defaultWorkspace?: number
    profession?: string
    contactInfo?: string
    timezone?: string
    snoozeUntil?: number
    snoozeDndStart?: string
    snoozeDndEnd?: string
    awayMode?: AwayMode
    offDays?: number[]
}

type GoogleConnectionStatus = {
    googleConnection: boolean
    googleEmail?: string
}

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
     * Logs in an existing user.
     *
     * @param args - Login credentials.
     * @param args.email - The user's email.
     * @param args.password - The user's password.
     * @param args.setSessionCookie - Optional flag to set a session cookie (default: true).
     * @returns The authenticated user object.
     *
     * @example
     * ```typescript
     * const user = await api.users.login({
     *   email: 'user@example.com',
     *   password: 'secret'
     * })
     * ```
     */
    async login(args: {
        email: string
        password: string
        setSessionCookie?: boolean
    }): Promise<User> {
        const response = await request<User>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/login`,
            undefined,
            args,
        )

        return UserSchema.parse(response.data)
    }

    /**
     * Logs out the current user and resets the session.
     */
    async logout(): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_USERS}/logout`, this.apiToken)
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

    /**
     * Updates the logged-in user's details.
     *
     * @param args - The user properties to update.
     * @returns The updated user object.
     *
     * @example
     * ```typescript
     * const user = await api.users.update({
     *   name: 'John Doe',
     *   timezone: 'America/New_York'
     * })
     * ```
     */
    async update(args: UpdateUserArgs): Promise<User> {
        const response = await request<User>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/update`,
            this.apiToken,
            args,
        )

        return UserSchema.parse(response.data)
    }

    /**
     * Updates the user's password.
     *
     * @param newPassword - The new password.
     * @returns The updated user object.
     */
    async updatePassword(newPassword: string): Promise<User> {
        const response = await request<User>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/update_password`,
            this.apiToken,
            { newPassword },
        )

        return UserSchema.parse(response.data)
    }

    /**
     * Invalidates the current API token and generates a new one.
     *
     * @returns The user object with the new token.
     *
     * @example
     * ```typescript
     * const user = await api.users.invalidateToken()
     * console.log('New token:', user.token)
     * ```
     */
    async invalidateToken(): Promise<User> {
        const response = await request<User>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/invalidate_token`,
            this.apiToken,
        )

        return UserSchema.parse(response.data)
    }

    /**
     * Validates a user token.
     *
     * @param token - The token to validate.
     */
    async validateToken(token: string): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_USERS}/validate_token`, undefined, {
            token,
        })
    }

    /**
     * Marks the user as active on a workspace (sets presence).
     *
     * @param workspaceId - The workspace ID.
     * @param platform - The platform: 'mobile', 'desktop', or 'api'.
     *
     * @example
     * ```typescript
     * await api.users.heartbeat(123, 'api')
     * ```
     */
    async heartbeat(workspaceId: number, platform: 'mobile' | 'desktop' | 'api'): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_USERS}/heartbeat`, this.apiToken, {
            workspaceId,
            platform,
        })
    }

    /**
     * Marks the user as inactive on a workspace (resets presence).
     *
     * @param workspaceId - The workspace ID.
     */
    async resetPresence(workspaceId: number): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/reset_presence`,
            this.apiToken,
            { workspaceId },
        )
    }

    /**
     * Sends a password reset email to the user.
     *
     * @param email - The user's email address.
     */
    async resetPassword(email: string): Promise<void> {
        await request('POST', this.getBaseUri(), `${ENDPOINT_USERS}/reset_password`, undefined, {
            email,
        })
    }

    /**
     * Sets a new password based on a reset code.
     *
     * @param resetCode - The reset code sent via email.
     * @param newPassword - The new password.
     * @returns The updated user object.
     */
    async setPassword(resetCode: string, newPassword: string): Promise<User> {
        const response = await request<User>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/set_password`,
            undefined,
            { resetCode, newPassword },
        )

        return UserSchema.parse(response.data)
    }

    /**
     * Checks whether the user's account is connected to a Google account.
     *
     * @returns Google connection status.
     */
    async isConnectedToGoogle(): Promise<GoogleConnectionStatus> {
        const response = await request<GoogleConnectionStatus>(
            'GET',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/is_connected_to_google`,
            this.apiToken,
        )

        return response.data
    }

    /**
     * Disconnects the user's account from their Google account.
     */
    async disconnectGoogle(): Promise<void> {
        await request(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/disconnect_google`,
            this.apiToken,
        )
    }

    /**
     * Deletes the user account. This deletes identifiable data such as full name and emails.
     * Note: This does not delete the user's content as the content is owned by the workspace.
     *
     * @param password - The user's password for confirmation.
     * @returns Status object with "ok" status.
     */
    async deleteUser(password: string): Promise<{ status: string }> {
        const response = await request<{ status: string }>(
            'POST',
            this.getBaseUri(),
            `${ENDPOINT_USERS}/delete`,
            this.apiToken,
            { password },
        )

        return response.data
    }
}
