import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ThreadsClient } from './threads-client'

describe('ThreadsClient', () => {
    let client: ThreadsClient

    // API format response (snake_case with timestamps)
    const mockThreadApiResponse = {
        id: 123,
        title: 'Test Thread',
        content: 'This is a test thread',
        creator: 1,
        channel_id: 1,
        workspace_id: 1,
        comment_count: 0,
        last_updated_ts: 1609459200,
        pinned: false,
        posted_ts: 1609459200,
        snippet: 'This is a test thread',
        snippet_creator: 1,
        starred: false,
        is_archived: false,
    }

    beforeEach(() => {
        client = new ThreadsClient({ apiToken: TEST_API_TOKEN })
    })

    describe('pinThread', () => {
        it('should pin a thread', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/pin'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.pinThread(123)
        })
    })

    describe('unpinThread', () => {
        it('should unpin a thread', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/unpin'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.unpinThread(123)
        })
    })

    describe('moveToChannel', () => {
        it('should move thread to another channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/move_to_channel'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, to_channel: 456 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.moveToChannel({ id: 123, toChannel: 456 })
        })
    })

    describe('markUnread', () => {
        it('should mark thread as unread with objIndex', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mark_unread'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, obj_index: 5 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markUnread({ id: 123, objIndex: 5 })
        })

        it('should mark entire thread as unread with -1', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mark_unread'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, obj_index: -1 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markUnread({ id: 123, objIndex: -1 })
        })
    })

    describe('markUnreadForOthers', () => {
        it('should mark thread as unread for others', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mark_unread_for_others'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, obj_index: 5 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markUnreadForOthers({ id: 123, objIndex: 5 })
        })

        it('should mark entire thread as unread for others with -1', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mark_unread_for_others'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, obj_index: -1 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markUnreadForOthers({ id: 123, objIndex: -1 })
        })
    })

    describe('markAllRead', () => {
        it('should mark all threads as read in workspace', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mark_all_read'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ workspace_id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markAllRead({ workspaceId: 123 })
        })

        it('should mark all threads as read in channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mark_all_read'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ channel_id: 456 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markAllRead({ channelId: 456 })
        })

        it('should throw error if neither workspaceId nor channelId provided', () => {
            expect(() => client.markAllRead({})).toThrow(
                'Either workspaceId or channelId is required',
            )
        })
    })

    describe('muteThread', () => {
        it('should mute thread for specified minutes', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/mute'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, minutes: 30 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockThreadApiResponse)
                }),
            )

            const result = await client.muteThread({ id: 123, minutes: 30 })
            expect(result.id).toBe(123)
            expect(result.lastUpdated).toBeInstanceOf(Date)
            expect(result.posted).toBeInstanceOf(Date)
        })
    })

    describe('unmuteThread', () => {
        it('should unmute thread', async () => {
            server.use(
                http.post(apiUrl('api/v3/threads/unmute'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockThreadApiResponse)
                }),
            )

            const result = await client.unmuteThread(123)
            expect(result.id).toBe(123)
            expect(result.lastUpdated).toBeInstanceOf(Date)
            expect(result.posted).toBeInstanceOf(Date)
        })
    })

    describe('closeThread', () => {
        const mockCommentApiResponse = {
            id: 500,
            content: 'Closing this thread.',
            creator: 1,
            thread_id: 789,
            workspace_id: 1,
            channel_id: 1,
            posted_ts: 1609459200,
            system_message: null,
        }

        it('should close a thread by adding a comment with thread_action', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Closing this thread.',
                        thread_action: 'close',
                    })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            const result = await client.closeThread({
                id: 789,
                content: 'Closing this thread.',
            })
            expect(result.id).toBe(500)
            expect(result.content).toBe('Closing this thread.')
            expect(result.threadId).toBe(789)
        })
    })

    describe('reopenThread', () => {
        const mockCommentApiResponse = {
            id: 501,
            content: 'Reopening for further discussion.',
            creator: 1,
            thread_id: 789,
            workspace_id: 1,
            channel_id: 1,
            posted_ts: 1609459200,
            system_message: null,
        }

        it('should reopen a thread by adding a comment with thread_action', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Reopening for further discussion.',
                        thread_action: 'reopen',
                    })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            const result = await client.reopenThread({
                id: 789,
                content: 'Reopening for further discussion.',
            })
            expect(result.id).toBe(501)
            expect(result.content).toBe('Reopening for further discussion.')
            expect(result.threadId).toBe(789)
        })
    })
})
