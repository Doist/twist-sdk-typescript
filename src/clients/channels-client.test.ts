import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ChannelsClient } from './channels-client'

describe('ChannelsClient', () => {
    let client: ChannelsClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new ChannelsClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(null)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('favoriteChannel', () => {
        it('should favorite a channel', async () => {
            await client.favoriteChannel(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'channels/favorite',
                TEST_API_TOKEN,
                { id: 123 },
            )
        })
    })

    describe('unfavoriteChannel', () => {
        it('should unfavorite a channel', async () => {
            await client.unfavoriteChannel(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'channels/unfavorite',
                TEST_API_TOKEN,
                { id: 123 },
            )
        })
    })

    describe('addUser', () => {
        it('should add a user to channel', async () => {
            await client.addUser(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'channels/add_user',
                TEST_API_TOKEN,
                { id: 123, userId: 456 },
            )
        })
    })

    describe('addUsers', () => {
        it('should add multiple users to channel', async () => {
            await client.addUsers(123, [456, 789, 101])

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'channels/add_users',
                TEST_API_TOKEN,
                { id: 123, userIds: [456, 789, 101] },
            )
        })
    })

    describe('removeUser', () => {
        it('should remove a user from channel', async () => {
            await client.removeUser(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'channels/remove_user',
                TEST_API_TOKEN,
                { id: 123, userId: 456 },
            )
        })
    })

    describe('removeUsers', () => {
        it('should remove multiple users from channel', async () => {
            await client.removeUsers(123, [456, 789, 101])

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'channels/remove_users',
                TEST_API_TOKEN,
                { id: 123, userIds: [456, 789, 101] },
            )
        })
    })
})
