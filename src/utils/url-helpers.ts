/**
 * Helper functions for creating Twist URLs
 */

export type TwistURLParams = {
    workspaceId: number
    channelId?: number
    conversationId?: number
    threadId?: number
    commentId?: number | string
    messageId?: number | string
    userId?: number
}

/**
 * Returns true if the thread ID represents a draft thread (negative ID)
 */
function isThreadDraft(threadId: number | string): boolean {
    return Number(threadId) < 0
}

/**
 * Builds a relative Twist URL based on the provided parameters
 * @param params - URL parameters including workspace, channel, conversation, thread, etc.
 * @returns A relative URL path
 * @example
 * getTwistURL({ workspaceId: 1, channelId: 42, threadId: 1337 })
 * // returns '/a/1/ch/42/t/1337/'
 */
export function getTwistURL(params: TwistURLParams): string {
    const { workspaceId, channelId, conversationId, threadId, commentId, messageId, userId } =
        params
    let url = `/a/${workspaceId}/`

    // url channel/thread/comment
    if (channelId) {
        url += `ch/${channelId}/`

        if (threadId) {
            if (isThreadDraft(threadId)) {
                url += `compose/${threadId}/`
            } else {
                url += `t/${threadId}/`
                // The API returns a commentId of -1 when the search query has matched
                // the thread title. Keeping this within the URL would break the scrolling
                // functionality as whilst there is an id, it will try to try to scroll to
                // the matched comment which in this case doesn't exist.
                if (commentId && commentId !== -1) {
                    url += `c/${commentId}`
                }
            }
        }
    } else if (threadId) {
        // url for /inbox/thread/comment
        url += `inbox/t/${threadId}/`

        // The API returns a commentId of -1 when the search query has matched
        // the thread title. Keeping this within the URL would break the scrolling
        // functionality as whilst there is an id, it will try to try to scroll to
        // the matched comment which in this case doesn't exist.
        if (commentId && commentId !== -1) {
            url += `c/${commentId}`
        }
    } else if (conversationId) {
        // url for /conversation/message
        url += `msg/${conversationId}/`

        if (messageId) {
            url += `m/${messageId}`
        }
    } else if (userId) {
        // link to user profile
        url += `people/u/${userId}`
    }

    return url
}

/**
 * Builds a full Twist URL (with protocol and hostname) based on the provided parameters
 * @param params - URL parameters including workspace, channel, conversation, thread, etc.
 * @param baseUrl - Optional base URL (defaults to 'https://twist.com')
 * @returns A complete URL including protocol and hostname
 * @example
 * getFullTwistURL({ workspaceId: 1, channelId: 42 })
 * // returns 'https://twist.com/a/1/ch/42/'
 */
export function getFullTwistURL(params: TwistURLParams, baseUrl = 'https://twist.com'): string {
    const twistURL = getTwistURL(params)
    return `${baseUrl}${twistURL}`
}

/**
 * Returns the URL for a thread in a channel
 * @param params - Object containing workspaceId, channelId, and threadId
 * @returns A relative URL path
 */
export function getThreadURL(params: {
    workspaceId: number
    channelId: number
    threadId: number
}): string {
    const { workspaceId, channelId, threadId } = params
    return threadId < 0
        ? `/a/${workspaceId}/ch/${channelId}/compose/${threadId}`
        : getTwistURL({ workspaceId, channelId, threadId })
}

/**
 * Returns the URL for a channel
 * @param params - Object containing workspaceId and channelId
 * @returns A relative URL path
 */
export function getChannelURL(params: { workspaceId: number; channelId: number }): string {
    return getTwistURL(params)
}

/**
 * Returns the URL for a conversation
 * @param params - Object containing workspaceId and conversationId
 * @returns A relative URL path
 */
export function getConversationURL(params: {
    workspaceId: number
    conversationId: number
}): string {
    return getTwistURL(params)
}

/**
 * Returns the URL for a specific message in a conversation
 * @param params - Object containing workspaceId, conversationId, and messageId
 * @returns A relative URL path
 */
export function getMessageURL(params: {
    workspaceId: number
    conversationId: number
    messageId: number | string
}): string {
    return getTwistURL(params)
}

/**
 * Returns the URL for a comment in a thread
 * @param params - Object containing workspaceId, channelId, threadId, and commentId
 * @returns A relative URL path
 */
export function getCommentURL(params: {
    workspaceId: number
    channelId: number
    threadId: number
    commentId: number | string
}): string {
    return getTwistURL(params)
}

/**
 * Returns the URL for the threads root (channels view)
 * @param workspaceId - The workspace ID
 * @returns A relative URL path
 */
export function getThreadsRootURL(workspaceId: number): string {
    return `/a/${workspaceId}/ch`
}

/**
 * Returns the URL for the inbox
 * @param workspaceId - The workspace ID
 * @param tab - Optional tab ('done' or 'mentions')
 * @returns A relative URL path
 */
export function getInboxURL(workspaceId: number, tab?: 'done' | 'mentions'): string {
    const tabParam = tab ? `/${tab}` : ''
    return `/a/${workspaceId}/inbox${tabParam}`
}

/**
 * Returns the URL for the messages/conversations root
 * @param workspaceId - The workspace ID
 * @returns A relative URL path
 */
export function getMessagesRootURL(workspaceId: number): string {
    return `/a/${workspaceId}/msg`
}

/**
 * Returns the URL for a user profile
 * @param params - Object containing workspaceId and userId
 * @returns A relative URL path
 */
export function getUserProfileURL(params: { workspaceId: number; userId: number }): string {
    return `/a/${params.workspaceId}/people/u/${params.userId}`
}

/**
 * Returns the URL for the saved threads view
 * @param workspaceId - The workspace ID
 * @returns A relative URL path
 */
export function getSavedThreadsRootURL(workspaceId: number): string {
    return `/a/${workspaceId}/saved`
}

/**
 * Returns the URL for a saved thread
 * @param params - Object containing workspaceId and threadId
 * @returns A relative URL path
 */
export function getSavedThreadURL(params: { workspaceId: number; threadId: number }): string {
    return `/a/${params.workspaceId}/saved/t/${params.threadId}`
}

/**
 * Returns the URL for the search root
 * @param workspaceId - The workspace ID
 * @returns A relative URL path
 */
export function getSearchRootURL(workspaceId: number): string {
    return `/a/${workspaceId}/search`
}

/**
 * Returns the URL for a search with a query
 * @param params - Object containing workspaceId and query
 * @returns A relative URL path with query parameters
 */
export function getSearchQueryURL(params: { workspaceId: number; query: string }): string {
    return `/a/${params.workspaceId}/search?q=${decodeURIComponent(params.query)}`
}

/**
 * Returns the URL for settings
 * @param params - Object containing workspaceId and optional initialLocation
 * @returns A relative URL path
 */
export function getSettingsURL(params: { workspaceId: number; initialLocation?: string }): string {
    return params.initialLocation
        ? `/a/${params.workspaceId}/settings/${params.initialLocation}`
        : `/a/${params.workspaceId}/settings`
}

/**
 * Returns the URL for the team members root
 * @param workspaceId - The workspace ID
 * @returns A relative URL path
 */
export function getTeamMembersRootURL(workspaceId: number): string {
    return `/a/${workspaceId}/people/u`
}
