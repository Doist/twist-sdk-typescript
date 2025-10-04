const BASE_URI = 'https://api.twist.com'

export const API_VERSION = 'v3'
export const API_BASE_URI = `/api/${API_VERSION}/`

export function getTwistBaseUri(domainBase: string = BASE_URI): string {
    return new URL(API_BASE_URI, domainBase).toString()
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
