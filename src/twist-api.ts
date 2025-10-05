import { ChannelsClient } from './clients/channels-client.js'
import { CommentsClient } from './clients/comments-client.js'
import { ConversationMessagesClient } from './clients/conversation-messages-client.js'
import { ConversationsClient } from './clients/conversations-client.js'
import { GroupsClient } from './clients/groups-client.js'
import { InboxClient } from './clients/inbox-client.js'
import { ReactionsClient } from './clients/reactions-client.js'
import { SearchClient } from './clients/search-client.js'
import { ThreadsClient } from './clients/threads-client.js'
import { UsersClient } from './clients/users-client.js'
import { WorkspaceUsersClient } from './clients/workspace-users-client.js'
import { WorkspacesClient } from './clients/workspaces-client.js'

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

    /**
     * Creates a new Twist API client.
     *
     * @param authToken - Your Twist API token.
     * @param baseUrl - Optional custom API base URL. If not provided, defaults to Twist's standard API endpoint.
     */
    constructor(authToken: string, baseUrl?: string) {
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
}
