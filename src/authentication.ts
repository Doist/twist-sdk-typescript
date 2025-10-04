import { v4 as uuid } from 'uuid'
import { isSuccess, request } from './rest-client'
import { TwistRequestError } from './types/errors'

/**
 * OAuth permission scopes for the Twist API.
 *
 * @remarks
 * Request only the permissions your application needs:
 *
 * **User Permissions:**
 * - `user:read` - Access user's personal settings
 * - `user:write` - Access and update user's personal settings
 *
 * **Workspace Permissions:**
 * - `workspaces:read` - Access teams the user is part of
 * - `workspaces:write` - Access and update teams the user is part of
 *
 * **Channel Permissions:**
 * - `channels:read` - Access channels
 * - `channels:write` - Access and update channels
 * - `channels:remove` - Access, update, and delete channels
 *
 * **Thread Permissions:**
 * - `threads:read` - Access threads
 * - `threads:write` - Access and update threads
 * - `threads:remove` - Access, update, and delete threads
 *
 * **Comment Permissions:**
 * - `comments:read` - Access comments
 * - `comments:write` - Access and update comments
 * - `comments:remove` - Access, update, and delete comments
 *
 * **Group Permissions:**
 * - `groups:read` - Access groups
 * - `groups:write` - Access and update groups
 * - `groups:remove` - Access, update, and delete groups
 *
 * **Message Permissions:**
 * - `messages:read` - Access messages
 * - `messages:write` - Access and update messages
 * - `messages:remove` - Access, update, and delete messages
 *
 * **Reaction Permissions:**
 * - `reactions:read` - Access reactions
 * - `reactions:write` - Access and update reactions
 * - `reactions:remove` - Access, update, and delete reactions
 *
 * **Search Permissions:**
 * - `search:read` - Search
 *
 * **Attachment Permissions:**
 * - `attachments:read` - Access attachments
 * - `attachments:write` - Access and update attachments
 *
 * **Notification Permissions:**
 * - `notifications:read` - Read user's notifications settings
 * - `notifications:write` - Read and update user's notifications settings
 */
export type TwistPermission =
    | 'user:read'
    | 'user:write'
    | 'workspaces:read'
    | 'workspaces:write'
    | 'channels:read'
    | 'channels:write'
    | 'channels:remove'
    | 'threads:read'
    | 'threads:write'
    | 'threads:remove'
    | 'comments:read'
    | 'comments:write'
    | 'comments:remove'
    | 'groups:read'
    | 'groups:write'
    | 'groups:remove'
    | 'messages:read'
    | 'messages:write'
    | 'messages:remove'
    | 'reactions:read'
    | 'reactions:write'
    | 'reactions:remove'
    | 'search:read'
    | 'attachments:read'
    | 'attachments:write'
    | 'notifications:read'
    | 'notifications:write'

export type AuthTokenRequestArgs = {
    clientId: string
    clientSecret: string
    code: string
    redirectUri?: string
}

export type AuthTokenResponse = {
    accessToken: string
    tokenType: string
    refreshToken?: string
    expiresIn?: number
    scope?: string
}

export type RevokeAuthTokenRequestArgs = {
    clientId: string
    clientSecret: string
    accessToken: string
}

export function getAuthStateParameter(): string {
    return uuid()
}

export function getAuthorizationUrl(
    clientId: string,
    permissions: TwistPermission[],
    state: string,
    redirectUri?: string,
    baseUrl?: string,
): string {
    if (!permissions?.length) {
        throw new Error('At least one scope value should be passed for permissions.')
    }

    const authBaseUrl = baseUrl ? `${baseUrl}/oauth` : 'https://twist.com/oauth'
    const scope = permissions.join(' ')
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        scope,
        state,
    })

    if (redirectUri) {
        params.append('redirect_uri', redirectUri)
    }

    return `${authBaseUrl}/authorize?${params.toString()}`
}

export async function getAuthToken(
    args: AuthTokenRequestArgs,
    baseUrl?: string,
): Promise<AuthTokenResponse> {
    const tokenUrl = baseUrl ? `${baseUrl}/oauth/token` : 'https://twist.com/oauth/token'

    const payload = {
        clientId: args.clientId,
        clientSecret: args.clientSecret,
        code: args.code,
        grantType: 'authorization_code',
        ...(args.redirectUri && { redirectUri: args.redirectUri }),
    }

    const response = await request<AuthTokenResponse>('POST', tokenUrl, '', undefined, payload)

    if (!isSuccess(response) || !response.data?.accessToken) {
        throw new TwistRequestError(
            'Authentication token exchange failed.',
            response.status,
            response.data,
        )
    }

    return response.data
}

export async function revokeAuthToken(
    args: RevokeAuthTokenRequestArgs,
    baseUrl?: string,
): Promise<boolean> {
    const revokeUrl = baseUrl ? `${baseUrl}/oauth/revoke` : 'https://twist.com/oauth/revoke'

    const response = await request('POST', revokeUrl, '', undefined, {
        clientId: args.clientId,
        clientSecret: args.clientSecret,
        token: args.accessToken,
    })

    return isSuccess(response)
}
