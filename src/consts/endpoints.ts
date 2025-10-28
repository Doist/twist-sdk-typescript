import type { ApiVersion } from '../types/api-version'

const BASE_URI = 'https://api.twist.com'

export const API_VERSION = 'v3'
/**
 * @deprecated Use getTwistBaseUri() instead. This constant is kept for backward compatibility.
 */
export const API_BASE_URI = `/api/${API_VERSION}/`

/**
 * Gets the base URI for Twist API requests.
 *
 * @param version - API version ('v3' or 'v4'). Defaults to 'v3'.
 * @param domainBase - Custom domain base URL. Defaults to Twist's API domain.
 * @returns Complete base URI with trailing slash (e.g., 'https://api.twist.com/api/v3/')
 */
export function getTwistBaseUri(version: ApiVersion = 'v3', domainBase: string = BASE_URI): string {
    return new URL(`/api/${version}/`, domainBase).toString()
}

export const ENDPOINT_USERS = 'users'
export const ENDPOINT_WORKSPACES = 'workspaces'
export const ENDPOINT_CHANNELS = 'channels'
export const ENDPOINT_THREADS = 'threads'
export const ENDPOINT_GROUPS = 'groups'
export const ENDPOINT_CONVERSATIONS = 'conversations'
export const ENDPOINT_COMMENTS = 'comments'
export const ENDPOINT_NOTIFICATIONS = 'notifications'
export const ENDPOINT_INBOX = 'inbox'
export const ENDPOINT_REACTIONS = 'reactions'
export const ENDPOINT_SEARCH = 'search'
export const ENDPOINT_CONVERSATION_MESSAGES = 'conversation_messages'
