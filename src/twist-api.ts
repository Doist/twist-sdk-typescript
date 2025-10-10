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

    /**
     * Creates a new Twist API client.
     *
     * @param authToken - Your Twist API token.
     * @param baseUrl - Optional custom API base URL. If not provided, defaults to Twist's standard API endpoint.
     */
    constructor(authToken: string, baseUrl?: string) {
        this.authToken = authToken
        this.baseUrl = baseUrl
        this.users = new UsersClient(authToken, baseUrl)
        this.workspaces = new WorkspacesClient(authToken, baseUrl)
        this.workspaceUsers = new WorkspaceUsersClient(authToken, baseUrl)
        this.channels = new ChannelsClient(authToken, baseUrl)
        this.threads = new ThreadsClient(authToken, baseUrl)
        this.groups = new GroupsClient(authToken, baseUrl)
        this.conversations = new ConversationsClient(authToken, baseUrl)
        this.comments = new CommentsClient(authToken, baseUrl)
        this.conversationMessages = new ConversationMessagesClient(authToken, baseUrl)
        this.inbox = new InboxClient(authToken, baseUrl)
        this.reactions = new ReactionsClient(authToken, baseUrl)
        this.search = new SearchClient(authToken, baseUrl)
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
        const builder = new BatchBuilder(this.authToken, this.baseUrl)
        return builder.execute(requests)
    }
}
