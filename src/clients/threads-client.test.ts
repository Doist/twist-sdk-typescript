import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { mockThread, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ThreadsClient } from './threads-client'

describe('ThreadsClient', () => {
    let client: ThreadsClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new ThreadsClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockThread)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('pinThread', () => {
        it('should pin a thread', async () => {
            await client.pinThread(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/pin',
                TEST_API_TOKEN,
                { id: 123 },
            )
        })
    })

    describe('unpinThread', () => {
        it('should unpin a thread', async () => {
            await client.unpinThread(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/unpin',
                TEST_API_TOKEN,
                { id: 123 },
            )
        })
    })

    describe('moveToChannel', () => {
        it('should move thread to another channel', async () => {
            await client.moveToChannel(123, 456)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/move_to_channel',
                TEST_API_TOKEN,
                { id: 123, toChannel: 456 },
            )
        })
    })

    describe('markUnread', () => {
        it('should mark thread as unread with objIndex', async () => {
            await client.markUnread(123, 5)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mark_unread',
                TEST_API_TOKEN,
                { id: 123, obj_index: 5 },
            )
        })

        it('should mark entire thread as unread with -1', async () => {
            await client.markUnread(123, -1)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mark_unread',
                TEST_API_TOKEN,
                { id: 123, obj_index: -1 },
            )
        })
    })

    describe('markUnreadForOthers', () => {
        it('should mark thread as unread for others', async () => {
            await client.markUnreadForOthers(123, 5)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mark_unread_for_others',
                TEST_API_TOKEN,
                { id: 123, obj_index: 5 },
            )
        })

        it('should mark entire thread as unread for others with -1', async () => {
            await client.markUnreadForOthers(123, -1)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mark_unread_for_others',
                TEST_API_TOKEN,
                { id: 123, obj_index: -1 },
            )
        })
    })

    describe('markAllRead', () => {
        it('should mark all threads as read in workspace', async () => {
            await client.markAllRead({ workspaceId: 123 })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mark_all_read',
                TEST_API_TOKEN,
                { workspace_id: 123 },
            )
        })

        it('should mark all threads as read in channel', async () => {
            await client.markAllRead({ channelId: 456 })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mark_all_read',
                TEST_API_TOKEN,
                { channel_id: 456 },
            )
        })

        it('should throw error if neither workspaceId nor channelId provided', async () => {
            await expect(client.markAllRead({})).rejects.toThrow(
                'Either workspaceId or channelId is required',
            )
        })
    })

    describe('muteThread', () => {
        it('should mute thread for specified minutes', async () => {
            const result = await client.muteThread(123, 30)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/mute',
                TEST_API_TOKEN,
                { id: 123, minutes: 30 },
            )
            expect(result).toEqual(mockThread)
        })
    })

    describe('unmuteThread', () => {
        it('should unmute thread', async () => {
            const result = await client.unmuteThread(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'threads/unmute',
                TEST_API_TOKEN,
                { id: 123 },
            )
            expect(result).toEqual(mockThread)
        })
    })
})
