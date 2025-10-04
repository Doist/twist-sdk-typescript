import { Channel, Comment, Conversation, Group, Thread, User, Workspace } from '../types/entities'

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
    createdTs: 1609459200,
}

export const mockChannel: Channel = {
    id: 1,
    name: 'general',
    creator: 1,
    public: true,
    workspaceId: 1,
    archived: false,
    createdTs: 1609459200,
}

export const mockThread: Thread = {
    id: 1,
    title: 'Test Thread',
    content: 'This is a test thread',
    creator: 1,
    channelId: 1,
    workspaceId: 1,
    commentCount: 0,
    lastUpdatedTs: 1609459200,
    pinned: false,
    postedTs: 1609459200,
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
}

export const mockConversation: Conversation = {
    id: 1,
    workspaceId: 1,
    userIds: [1, 2],
    messageCount: 1,
    lastObjIndex: 0,
    snippet: 'Hello there',
    snippetCreators: [1],
    lastActiveTs: 1609459200,
    archived: false,
    createdTs: 1609459200,
}

export const mockComment: Comment = {
    id: 1,
    content: 'This is a comment',
    creator: 1,
    threadId: 1,
    postedTs: 1609459200,
}
