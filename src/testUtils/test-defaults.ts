import {
    Channel,
    Comment,
    Conversation,
    Group,
    Thread,
    User,
    Workspace,
    WorkspaceUser,
} from '../types/entities'

export const TEST_API_TOKEN = 'test-api-token'

export const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    shortName: 'TU',
    bot: false,
    timezone: 'America/New_York',
    removed: false,
    lang: 'en',
}

export const mockWorkspace: Workspace = {
    id: 1,
    name: 'Test Workspace',
    creator: 1,
    created: new Date('2021-01-01T00:00:00Z'),
}

export const mockChannel: Channel = {
    id: 1,
    name: 'general',
    creator: 1,
    public: true,
    workspaceId: 1,
    archived: false,
    created: new Date('2021-01-01T00:00:00Z'),
    version: 0,
}

export const mockThread: Thread = {
    id: 1,
    title: 'Test Thread',
    content: 'This is a test thread',
    creator: 1,
    channelId: 1,
    workspaceId: 1,
    commentCount: 0,
    lastUpdated: new Date('2021-01-01T00:00:00Z'),
    pinned: false,
    posted: new Date('2021-01-01T00:00:00Z'),
    snippet: 'This is a test thread',
    snippetCreator: 1,
    starred: false,
    isArchived: false,
}

export const mockGroup: Group = {
    id: 1,
    name: 'Test Group',
    workspaceId: 1,
    userIds: [1, 2, 3],
    version: 0,
}

export const mockConversation: Conversation = {
    id: 1,
    workspaceId: 1,
    userIds: [1, 2],
    messageCount: 1,
    lastObjIndex: 0,
    snippet: 'Hello there',
    snippetCreators: [1],
    lastActive: new Date('2021-01-01T00:00:00Z'),
    archived: false,
    created: new Date('2021-01-01T00:00:00Z'),
    creator: 1,
}

export const mockComment: Comment = {
    id: 1,
    content: 'This is a comment',
    creator: 1,
    threadId: 1,
    posted: new Date('2021-01-01T00:00:00Z'),
}

export const mockWorkspaceUser: WorkspaceUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    userType: 'USER',
    shortName: 'TU',
    firstName: 'Test',
    avatarId: null,
    avatarUrls: null,
    awayMode: null,
    bot: false,
    contactInfo: null,
    dateFormat: null,
    featureFlags: null,
    profession: null,
    removed: false,
    restricted: null,
    setupPending: null,
    theme: null,
    timeFormat: null,
    timezone: 'America/New_York',
    version: 1,
}
