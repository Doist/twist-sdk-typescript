import { v4 as uuid } from 'uuid'
import { isSuccess, request } from './rest-client'
import { TwistRequestError } from './types/errors'

export type TwistPermission =
    | 'user:read'
    | 'user:write'
    | 'workspaces:read'
    | 'workspaces:write'
    | 'channels:read'
    | 'channels:write'
    | 'threads:read'
    | 'threads:write'
    | 'groups:read'
    | 'groups:write'
    | 'conversations:read'
    | 'conversations:write'

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
