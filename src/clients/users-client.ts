import { ENDPOINT_USERS, getTwistBaseUri } from '../consts/endpoints'
import { request } from '../rest-client'
import type { BatchRequestDescriptor } from '../types/batch'
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
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    login(
        args: { email: string; password: string; setSessionCookie?: boolean },
        options: { batch: true },
    ): BatchRequestDescriptor<User>
    login(args: { email: string; password: string; setSessionCookie?: boolean }): Promise<User>
    login(
        args: { email: string; password: string; setSessionCookie?: boolean },
        options?: { batch?: boolean },
    ): Promise<User> | BatchRequestDescriptor<User> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/login`
        const params = args
        const schema = UserSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<User>(method, this.getBaseUri(), url, undefined, params).then((response) =>
            schema.parse(response.data),
        )
    }

    /**
     * Logs out the current user and resets the session.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    logout(options: { batch: true }): BatchRequestDescriptor<void>
    logout(options?: { batch?: false }): Promise<void>
    logout(options?: { batch?: boolean }): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/logout`

        if (options?.batch) {
            return { method, url }
        }

        return request(method, this.getBaseUri(), url, this.apiToken).then(() => undefined)
    }

    /**
     * Gets the associated user for the access token used in the request.
     *
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The authenticated user's information.
     *
     * @example
     * ```typescript
     * const user = await api.users.getSessionUser()
     * console.log(user.name, user.email)
     * ```
     */
    getSessionUser(options: { batch: true }): BatchRequestDescriptor<User>
    getSessionUser(options?: { batch?: false }): Promise<User>
    getSessionUser(options?: { batch?: boolean }): Promise<User> | BatchRequestDescriptor<User> {
        const method = 'GET'
        const url = `${ENDPOINT_USERS}/get_session_user`
        const schema = UserSchema

        if (options?.batch) {
            return { method, url, schema }
        }

        return request<User>(method, this.getBaseUri(), url, this.apiToken).then((response) =>
            schema.parse(response.data),
        )
    }

    /**
     * Updates the logged-in user's details.
     *
     * @param args - The user properties to update.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
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
    update(args: UpdateUserArgs, options: { batch: true }): BatchRequestDescriptor<User>
    update(args: UpdateUserArgs, options?: { batch?: false }): Promise<User>
    update(
        args: UpdateUserArgs,
        options?: { batch?: boolean },
    ): Promise<User> | BatchRequestDescriptor<User> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/update`
        const params = args
        const schema = UserSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<User>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Updates the user's password.
     *
     * @param newPassword - The new password.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated user object.
     */
    updatePassword(newPassword: string, options: { batch: true }): BatchRequestDescriptor<User>
    updatePassword(newPassword: string, options?: { batch?: false }): Promise<User>
    updatePassword(
        newPassword: string,
        options?: { batch?: boolean },
    ): Promise<User> | BatchRequestDescriptor<User> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/update_password`
        const params = { newPassword }
        const schema = UserSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<User>(method, this.getBaseUri(), url, this.apiToken, params).then(
            (response) => schema.parse(response.data),
        )
    }

    /**
     * Invalidates the current API token and generates a new one.
     *
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The user object with the new token.
     *
     * @example
     * ```typescript
     * const user = await api.users.invalidateToken()
     * console.log('New token:', user.token)
     * ```
     */
    invalidateToken(options: { batch: true }): BatchRequestDescriptor<User>
    invalidateToken(options?: { batch?: false }): Promise<User>
    invalidateToken(options?: { batch?: boolean }): Promise<User> | BatchRequestDescriptor<User> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/invalidate_token`
        const schema = UserSchema

        if (options?.batch) {
            return { method, url, schema }
        }

        return request<User>(method, this.getBaseUri(), url, this.apiToken).then((response) =>
            schema.parse(response.data),
        )
    }

    /**
     * Validates a user token.
     *
     * @param token - The token to validate.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    validateToken(token: string, options: { batch: true }): BatchRequestDescriptor<void>
    validateToken(token: string, options?: { batch?: false }): Promise<void>
    validateToken(
        token: string,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/validate_token`
        const params = { token }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, undefined, params).then(() => undefined)
    }

    /**
     * Marks the user as active on a workspace (sets presence).
     *
     * @param workspaceId - The workspace ID.
     * @param platform - The platform: 'mobile', 'desktop', or 'api'.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     *
     * @example
     * ```typescript
     * await api.users.heartbeat(123, 'api')
     * ```
     */
    heartbeat(
        workspaceId: number,
        platform: 'mobile' | 'desktop' | 'api',
        options: { batch: true },
    ): BatchRequestDescriptor<void>
    heartbeat(
        workspaceId: number,
        platform: 'mobile' | 'desktop' | 'api',
        options?: { batch?: false },
    ): Promise<void>
    heartbeat(
        workspaceId: number,
        platform: 'mobile' | 'desktop' | 'api',
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/heartbeat`
        const params = { workspaceId, platform }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Marks the user as inactive on a workspace (resets presence).
     *
     * @param workspaceId - The workspace ID.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    resetPresence(workspaceId: number, options: { batch: true }): BatchRequestDescriptor<void>
    resetPresence(workspaceId: number, options?: { batch?: false }): Promise<void>
    resetPresence(
        workspaceId: number,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/reset_presence`
        const params = { workspaceId }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, this.apiToken, params).then(() => undefined)
    }

    /**
     * Sends a password reset email to the user.
     *
     * @param email - The user's email address.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    resetPassword(email: string, options: { batch: true }): BatchRequestDescriptor<void>
    resetPassword(email: string, options?: { batch?: false }): Promise<void>
    resetPassword(
        email: string,
        options?: { batch?: boolean },
    ): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/reset_password`
        const params = { email }

        if (options?.batch) {
            return { method, url, params }
        }

        return request(method, this.getBaseUri(), url, undefined, params).then(() => undefined)
    }

    /**
     * Sets a new password based on a reset code.
     *
     * @param resetCode - The reset code sent via email.
     * @param newPassword - The new password.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns The updated user object.
     */
    setPassword(
        resetCode: string,
        newPassword: string,
        options: { batch: true },
    ): BatchRequestDescriptor<User>
    setPassword(resetCode: string, newPassword: string, options?: { batch?: false }): Promise<User>
    setPassword(
        resetCode: string,
        newPassword: string,
        options?: { batch?: boolean },
    ): Promise<User> | BatchRequestDescriptor<User> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/set_password`
        const params = { resetCode, newPassword }
        const schema = UserSchema

        if (options?.batch) {
            return { method, url, params, schema }
        }

        return request<User>(method, this.getBaseUri(), url, undefined, params).then((response) =>
            schema.parse(response.data),
        )
    }

    /**
     * Checks whether the user's account is connected to a Google account.
     *
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns Google connection status.
     */
    isConnectedToGoogle(options: { batch: true }): BatchRequestDescriptor<GoogleConnectionStatus>
    isConnectedToGoogle(options?: { batch?: false }): Promise<GoogleConnectionStatus>
    isConnectedToGoogle(options?: {
        batch?: boolean
    }): Promise<GoogleConnectionStatus> | BatchRequestDescriptor<GoogleConnectionStatus> {
        const method = 'GET'
        const url = `${ENDPOINT_USERS}/is_connected_to_google`

        if (options?.batch) {
            return { method, url }
        }

        return request<GoogleConnectionStatus>(method, this.getBaseUri(), url, this.apiToken).then(
            (response) => response.data,
        )
    }

    /**
     * Disconnects the user's account from their Google account.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     */
    disconnectGoogle(options: { batch: true }): BatchRequestDescriptor<void>
    disconnectGoogle(options?: { batch?: false }): Promise<void>
    disconnectGoogle(options?: { batch?: boolean }): Promise<void> | BatchRequestDescriptor<void> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/disconnect_google`

        if (options?.batch) {
            return { method, url }
        }

        return request(method, this.getBaseUri(), url, this.apiToken).then(() => undefined)
    }

    /**
     * Deletes the user account. This deletes identifiable data such as full name and emails.
     * Note: This does not delete the user's content as the content is owned by the workspace.
     *
     * @param password - The user's password for confirmation.
     * @param options - Optional configuration. Set `batch: true` to return a descriptor for batch requests.
     * @returns Status object with "ok" status.
     */
    deleteUser(
        password: string,
        options: { batch: true },
    ): BatchRequestDescriptor<{ status: string }>
    deleteUser(password: string, options?: { batch?: false }): Promise<{ status: string }>
    deleteUser(
        password: string,
        options?: { batch?: boolean },
    ): Promise<{ status: string }> | BatchRequestDescriptor<{ status: string }> {
        const method = 'POST'
        const url = `${ENDPOINT_USERS}/delete`
        const params = { password }

        if (options?.batch) {
            return { method, url, params }
        }

        return request<{ status: string }>(
            method,
            this.getBaseUri(),
            url,
            this.apiToken,
            params,
        ).then((response) => response.data)
    }
}
