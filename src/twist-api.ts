import { ChannelsClient } from './clients/channels-client'
import { CommentsClient } from './clients/comments-client'
import { ConversationsClient } from './clients/conversations-client'
import { GroupsClient } from './clients/groups-client'
import { ThreadsClient } from './clients/threads-client'
import { UsersClient } from './clients/users-client'
import { WorkspaceUsersClient } from './clients/workspace-users-client'
import { WorkspacesClient } from './clients/workspaces-client'

export class TwistApi {
    public users: UsersClient
    public workspaces: WorkspacesClient
    public workspaceUsers: WorkspaceUsersClient
    public channels: ChannelsClient
    public threads: ThreadsClient
    public groups: GroupsClient
    public conversations: ConversationsClient
    public comments: CommentsClient

    constructor(authToken: string, baseUrl?: string) {
        this.users = new UsersClient(authToken, baseUrl)
        this.workspaces = new WorkspacesClient(authToken, baseUrl)
        this.workspaceUsers = new WorkspaceUsersClient(authToken, baseUrl)
        this.channels = new ChannelsClient(authToken, baseUrl)
        this.threads = new ThreadsClient(authToken, baseUrl)
        this.groups = new GroupsClient(authToken, baseUrl)
        this.conversations = new ConversationsClient(authToken, baseUrl)
        this.comments = new CommentsClient(authToken, baseUrl)
    }
}
