import { UsersClient } from './users-client'
import { setupRestClientMock } from '../testUtils/mocks'
import { mockUser, TEST_API_TOKEN } from '../testUtils/test-defaults'

describe('UsersClient', () => {
    let client: UsersClient
    let mockRequest: jest.SpyInstance

    beforeEach(() => {
        client = new UsersClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockUser)
    })

    afterEach(() => {
        jest.clearAllMocks()
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
