import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { CommentsClient } from './comments-client'

describe('CommentsClient', () => {
    let client: CommentsClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new CommentsClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(null)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('markPosition', () => {
        it('should mark read position in thread', async () => {
            await client.markPosition(32038, 206113)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'comments/mark_position',
                TEST_API_TOKEN,
                { thread_id: 32038, comment_id: 206113 },
            )
        })
    })
})
