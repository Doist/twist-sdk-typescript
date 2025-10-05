import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { GroupsClient } from './groups-client'

describe('GroupsClient', () => {
    let client: GroupsClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new GroupsClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(null)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('addUsers', () => {
        it('should add multiple users to group', async () => {
            await client.addUsers(123, [456, 789, 101])

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'groups/add_users',
                TEST_API_TOKEN,
                { id: 123, userIds: [456, 789, 101] },
            )
        })
    })

    describe('removeUser', () => {
        it('should remove a user from group', async () => {
            await client.removeUser(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'groups/remove_user',
                TEST_API_TOKEN,
                { id: 123, userId: 456 },
            )
        })
    })

    describe('removeUsers', () => {
        it('should remove multiple users from group', async () => {
            await client.removeUsers(123, [456, 789, 101])

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'groups/remove_users',
                TEST_API_TOKEN,
                { id: 123, userIds: [456, 789, 101] },
            )
        })
    })
})
