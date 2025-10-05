import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { mockWorkspaceUser, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { WorkspaceUsersClient } from './workspace-users-client'

describe('WorkspaceUsersClient', () => {
    let client: WorkspaceUsersClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new WorkspaceUsersClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockWorkspaceUser)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getUserById', () => {
        it('should get user by id', async () => {
            mockRequest = setupRestClientMock(mockWorkspaceUser)

            const result = await client.getUserById(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v4/',
                'workspace_users/getone',
                TEST_API_TOKEN,
                { id: 123, user_id: 456 },
            )
            expect(result).toEqual(mockWorkspaceUser)
        })
    })

    describe('getUserByEmail', () => {
        it('should get user by email', async () => {
            mockRequest = setupRestClientMock(mockWorkspaceUser)

            const result = await client.getUserByEmail(123, 'user@example.com')

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v4/',
                'workspace_users/get_by_email',
                TEST_API_TOKEN,
                { id: 123, email: 'user@example.com' },
            )
            expect(result).toEqual(mockWorkspaceUser)
        })
    })

    describe('getUserInfo', () => {
        it('should get user info', async () => {
            const mockUserInfo = {
                userId: 456,
                workspaceId: 123,
                role: 'admin',
                joinedDate: '2021-01-01',
            }
            mockRequest = setupRestClientMock(mockUserInfo)

            const result = await client.getUserInfo(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v4/',
                'workspace_users/get_info',
                TEST_API_TOKEN,
                { id: 123, user_id: 456 },
            )
            expect(result).toEqual(mockUserInfo)
        })
    })

    describe('getUserLocalTime', () => {
        it('should get user local time', async () => {
            const mockLocalTime = '2017-05-10 07:55:40'
            mockRequest = setupRestClientMock(mockLocalTime)

            const result = await client.getUserLocalTime(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v4/',
                'workspace_users/get_local_time',
                TEST_API_TOKEN,
                { id: 123, user_id: 456 },
            )
            expect(result).toBe(mockLocalTime)
        })
    })
})
