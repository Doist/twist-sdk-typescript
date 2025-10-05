import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks.js'
import { mockUser, TEST_API_TOKEN } from '../testUtils/test-defaults.js'
import { UsersClient } from './users-client.js'

describe('UsersClient', () => {
    let client: UsersClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new UsersClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockUser)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getSessionUser', () => {
        it('should get current user', async () => {
            const result = await client.getSessionUser()

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v3/',
                'users/get_session_user',
                TEST_API_TOKEN,
            )
            expect(result).toEqual(mockUser)
        })
    })
})
