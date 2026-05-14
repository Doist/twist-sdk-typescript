import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { CommentsClient } from './comments-client'

describe('CommentsClient', () => {
    let client: CommentsClient

    beforeEach(() => {
        client = new CommentsClient({ apiToken: TEST_API_TOKEN })
    })

    describe('getComments', () => {
        it('should send newerThan as newer_than_ts query parameter', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/comments/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('newer_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('thread_id')).toBe('789')
                    return HttpResponse.json([])
                }),
            )

            await client.getComments({ threadId: 789, newerThan: date })
        })

        it('should send olderThan as older_than_ts query parameter', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/comments/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('older_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('thread_id')).toBe('789')
                    return HttpResponse.json([])
                }),
            )

            await client.getComments({ threadId: 789, olderThan: date })
        })

        it('should support deprecated from param as newer_than_ts', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/comments/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('newer_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('thread_id')).toBe('789')
                    return HttpResponse.json([])
                }),
            )

            await client.getComments({ threadId: 789, from: date })
        })
    })

    describe('createComment', () => {
        const mockCommentApiResponse = {
            id: 500,
            content: 'Reply content',
            creator: 1,
            thread_id: 789,
            workspace_id: 1,
            channel_id: 1,
            posted_ts: 1609459200,
            system_message: null,
        }

        it('should send groups in POST body', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Reply content',
                        groups: [10, 20],
                    })
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            await client.createComment({
                threadId: 789,
                content: 'Reply content',
                groups: [10, 20],
            })
        })

        it("should translate notifyAudience 'thread' to groups [2]", async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Reply content',
                        groups: [2],
                    })
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            await client.createComment({
                threadId: 789,
                content: 'Reply content',
                notifyAudience: 'thread',
            })
        })

        it("should translate notifyAudience 'channel' to groups [1]", async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Reply content',
                        groups: [1],
                    })
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            await client.createComment({
                threadId: 789,
                content: 'Reply content',
                notifyAudience: 'channel',
            })
        })

        it('should merge notifyAudience with custom groups and individual recipients', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Reply content',
                        groups: [7, 2],
                        recipients: [101, 202],
                    })
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            await client.createComment({
                threadId: 789,
                content: 'Reply content',
                notifyAudience: 'thread',
                groups: [7],
                recipients: [101, 202],
            })
        })

        it('should send directMentions as direct_mentions in POST body', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'Reply @user1 @user2',
                        direct_mentions: [101, 202],
                    })
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            await client.createComment({
                threadId: 789,
                content: 'Reply @user1 @user2',
                directMentions: [101, 202],
            })
        })

        it('should send attachments as a snake_cased array in POST body', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/add'), async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>
                    expect(body).toEqual({
                        thread_id: 789,
                        content: 'See attached',
                        attachments: [
                            {
                                attachment_id: 'abc123',
                                url_type: 'file',
                                file_name: 'spec.pdf',
                                file_size: 12345,
                                underlying_type: 'application/pdf',
                                upload_state: 'uploaded',
                                url: 'https://files.twist.com/abc/spec.pdf',
                            },
                        ],
                    })
                    return HttpResponse.json(mockCommentApiResponse)
                }),
            )

            await client.createComment({
                threadId: 789,
                content: 'See attached',
                attachments: [
                    {
                        attachmentId: 'abc123',
                        urlType: 'file',
                        fileName: 'spec.pdf',
                        fileSize: 12345,
                        underlyingType: 'application/pdf',
                        uploadState: 'uploaded',
                        url: 'https://files.twist.com/abc/spec.pdf',
                    },
                ],
            })
        })

        it('should reject sentinel group IDs in `groups`', () => {
            expect(() =>
                client.createComment({
                    threadId: 789,
                    content: 'Reply',
                    groups: [2],
                }),
            ).toThrow(/sentinel/i)
            expect(() =>
                client.createComment({
                    threadId: 789,
                    content: 'Reply',
                    groups: [7, 1],
                }),
            ).toThrow(/sentinel/i)
        })

        it('should reject an invalid `notifyAudience` value at runtime', () => {
            expect(() =>
                client.createComment({
                    threadId: 789,
                    content: 'Reply',
                    // Simulate a JS caller passing an unvalidated string.
                    notifyAudience: 'workspace' as unknown as 'channel',
                }),
            ).toThrow(/notifyAudience/)
        })

        it('should return a batch descriptor with the translated payload', () => {
            const descriptor = client.createComment(
                {
                    threadId: 789,
                    content: 'Reply',
                    notifyAudience: 'thread',
                    groups: [7],
                    recipients: [101],
                },
                { batch: true },
            )

            expect(descriptor.method).toBe('POST')
            expect(descriptor.url).toBe('comments/add')
            expect(descriptor.params).toEqual({
                threadId: 789,
                content: 'Reply',
                groups: [7, 2],
                recipients: [101],
            })
        })
    })

    describe('markPosition', () => {
        it('should mark read position in thread', async () => {
            server.use(
                http.post(apiUrl('api/v3/comments/mark_position'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ thread_id: 32038, comment_id: 206113 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.markPosition({ threadId: 32038, commentId: 206113 })
        })
    })
})
