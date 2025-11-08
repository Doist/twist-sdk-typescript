import { BatchBuilder } from './batch-builder'
import { ChannelsClient } from './clients/channels-client'
import { CommentsClient } from './clients/comments-client'
import { ConversationMessagesClient } from './clients/conversation-messages-client'
import { ConversationsClient } from './clients/conversations-client'
import { GroupsClient } from './clients/groups-client'
import { InboxClient } from './clients/inbox-client'
import { ReactionsClient } from './clients/reactions-client'
import { SearchClient } from './clients/search-client'
import { ThreadsClient } from './clients/threads-client'
import { UsersClient } from './clients/users-client'
import { WorkspaceUsersClient } from './clients/workspace-users-client'
import { WorkspacesClient } from './clients/workspaces-client'
import type { BatchRequestDescriptor, BatchResponseArray } from './types/batch'
import type { CustomFetch } from './types/http'

export type TwistApiOptions = {
    /** Optional custom API base URL. If not provided, defaults to Twist's standard API endpoint. */
    baseUrl?: string
    /** Optional custom fetch implementation for cross-platform compatibility (e.g., Obsidian, React Native, Electron). */
    customFetch?: CustomFetch
}

/**
 * The main API client for interacting with the Twist REST API.
 *
 * @example
 * ```typescript
 * import { TwistApi } from '@doist/twist-sdk'
 *
 * const api = new TwistApi('your-api-token')
 * const user = await api.users.getSessionUser()
 * ```
 */
export class TwistApi {
    public users: UsersClient
    public workspaces: WorkspacesClient
    public workspaceUsers: WorkspaceUsersClient
    public channels: ChannelsClient
    public threads: ThreadsClient
    public groups: GroupsClient
    public conversations: ConversationsClient
    public comments: CommentsClient
    public conversationMessages: ConversationMessagesClient
    public inbox: InboxClient
    public reactions: ReactionsClient
    public search: SearchClient

    private authToken: string
    private baseUrl?: string
    private customFetch?: CustomFetch

    /**
     * Creates a new Twist API client.
     *
     * @param authToken - Your Twist API token.
     * @param options - Optional configuration options.
     * @param options.baseUrl - Optional custom API base URL. If not provided, defaults to Twist's standard API endpoint.
     * @param options.customFetch - Optional custom fetch implementation for cross-platform compatibility.
     *
     * @example
     * ```typescript
     * // Basic usage
     * const api = new TwistApi('your-api-token')
     *
     * // With custom base URL
     * const api = new TwistApi('your-api-token', { baseUrl: 'https://custom.api.com' })
     *
     * // With custom fetch (e.g., for Obsidian)
     * const api = new TwistApi('your-api-token', { customFetch: myCustomFetch })
     * ```
     */
    constructor(authToken: string, options?: TwistApiOptions) {
        this.authToken = authToken
        this.baseUrl = options?.baseUrl
        this.customFetch = options?.customFetch

        const clientConfig = {
            apiToken: authToken,
            baseUrl: options?.baseUrl,
            customFetch: options?.customFetch,
        }
        const workspaceUserConfig = {
            apiToken: authToken,
            baseUrl: options?.baseUrl,
            version: 'v4' as const,
            customFetch: options?.customFetch,
        }

        this.users = new UsersClient(clientConfig)
        this.workspaces = new WorkspacesClient(clientConfig)
        this.workspaceUsers = new WorkspaceUsersClient(workspaceUserConfig)
        this.channels = new ChannelsClient(clientConfig)
        this.threads = new ThreadsClient(clientConfig)
        this.groups = new GroupsClient(clientConfig)
        this.conversations = new ConversationsClient(clientConfig)
        this.comments = new CommentsClient(clientConfig)
        this.conversationMessages = new ConversationMessagesClient(clientConfig)
        this.inbox = new InboxClient(clientConfig)
        this.reactions = new ReactionsClient(clientConfig)
        this.search = new SearchClient(clientConfig)
    }

    /**
     * Executes multiple API requests in a single HTTP call using the batch endpoint.
     *
     * @param requests - Batch request descriptors (obtained by passing `{ batch: true }` to API methods)
     * @returns Array of batch responses with processed data
     *
     * @example
     * ```typescript
     * const results = await api.batch(
     *   api.workspaceUsers.getUserById(123, 456, { batch: true }),
     *   api.workspaceUsers.getUserById(123, 789, { batch: true })
     * )
     * console.log(results[0].data.name, results[1].data.name)
     * ```
     */
    batch<T extends readonly BatchRequestDescriptor<unknown>[]>(
        ...requests: T
    ): Promise<BatchResponseArray<T>> {
        const builder = new BatchBuilder({
            apiToken: this.authToken,
            baseUrl: this.baseUrl,
            customFetch: this.customFetch,
        })
        return builder.execute(requests)
    }
}
