import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { mockConversation, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ConversationsClient } from './conversations-client'

describe('ConversationsClient', () => {
    let client: ConversationsClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new ConversationsClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockConversation)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('updateConversation', () => {
        it('should update conversation with title only', async () => {
            const result = await client.updateConversation(123, 'New Title')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'conversations/update',
                TEST_API_TOKEN,
                { id: 123, title: 'New Title' },
            )
            expect(result).toEqual(mockConversation)
        })

        it('should update conversation with archived flag', async () => {
            await client.updateConversation(123, 'New Title', true)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'conversations/update',
                TEST_API_TOKEN,
                { id: 123, title: 'New Title', archived: true },
            )
        })
    })

    describe('addUsers', () => {
        it('should add multiple users to conversation', async () => {
            await client.addUsers(123, [456, 789, 101])

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'conversations/add_users',
                TEST_API_TOKEN,
                { id: 123, userIds: [456, 789, 101] },
            )
        })
    })

    describe('removeUsers', () => {
        it('should remove multiple users from conversation', async () => {
            await client.removeUsers(123, [456, 789, 101])

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'conversations/remove_users',
                TEST_API_TOKEN,
                { id: 123, userIds: [456, 789, 101] },
            )
        })
    })

    describe('muteConversation', () => {
        it('should mute conversation for specified minutes', async () => {
            const result = await client.muteConversation(123, 30)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'conversations/mute',
                TEST_API_TOKEN,
                { id: 123, minutes: 30 },
            )
            expect(result).toEqual(mockConversation)
        })
    })

    describe('unmuteConversation', () => {
        it('should unmute conversation', async () => {
            const result = await client.unmuteConversation(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'conversations/unmute',
                TEST_API_TOKEN,
                { id: 123 },
            )
            expect(result).toEqual(mockConversation)
        })
    })
})
