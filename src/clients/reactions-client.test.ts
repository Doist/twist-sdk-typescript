import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ReactionsClient } from './reactions-client'

describe('ReactionsClient', () => {
    let client: ReactionsClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new ReactionsClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(null)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('get', () => {
        it('should get reactions for a thread', async () => {
            const mockReactions = { '👍': [1, 2, 3], '❤️': [4, 5] }
            mockRequest = setupRestClientMock(mockReactions)

            const result = await client.get({ threadId: 789 })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'reactions/get',
                TEST_API_TOKEN,
                { thread_id: 789 },
            )
            expect(result).toEqual(mockReactions)
        })

        it('should get reactions for a comment', async () => {
            const mockReactions = { '🎉': [1, 2] }
            mockRequest = setupRestClientMock(mockReactions)

            const result = await client.get({ commentId: 206113 })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'reactions/get',
                TEST_API_TOKEN,
                { comment_id: 206113 },
            )
            expect(result).toEqual(mockReactions)
        })

        it('should get reactions for a message', async () => {
            mockRequest = setupRestClientMock(null)

            const result = await client.get({ messageId: 514069 })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'reactions/get',
                TEST_API_TOKEN,
                { message_id: 514069 },
            )
            expect(result).toBeNull()
        })

        it('should throw error when no id provided', async () => {
            await expect(client.get({})).rejects.toThrow(
                'Must provide one of: threadId, commentId, or messageId',
            )
        })
    })
})
