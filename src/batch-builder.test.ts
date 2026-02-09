import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { server } from './testUtils/msw-setup'
import { TEST_API_TOKEN } from './testUtils/test-defaults'
import { TwistApi } from './twist-api'

describe('BatchBuilder', () => {
    let api: TwistApi

    beforeEach(() => {
        api = new TwistApi(TEST_API_TOKEN)
    })

    describe('batch', () => {
        it('should have a batch method', () => {
            expect(typeof api.batch).toBe('function')
        })
    })

    describe('add and execute', () => {
        it('should batch multiple getUserById requests', async () => {
            const mockUser1 = {
                id: 456,
                name: 'User One',
                email: 'user1@example.com',
                user_type: 'USER',
                short_name: 'U1',
                timezone: 'UTC',
                removed: false,
                bot: false,
                version: 1,
            }

            const mockUser2 = {
                id: 789,
                name: 'User Two',
                email: 'user2@example.com',
                user_type: 'USER',
                short_name: 'U2',
                timezone: 'UTC',
                removed: false,
                bot: false,
                version: 1,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async ({ request }) => {
                    const body = await request.text()
                    const params = new URLSearchParams(body)
                    const requestsStr = params.get('requests')
                    const parallel = params.get('parallel')

                    expect(requestsStr).toBeDefined()
                    expect(parallel).toBe('true') // All GET requests

                    const requests = JSON.parse(requestsStr || '[]')
                    expect(requests).toHaveLength(2)
                    expect(requests[0].method).toBe('GET')
                    expect(requests[0].url).toContain('workspace_users/getone')
                    expect(requests[0].url).toContain('user_id=456')
                    expect(requests[1].url).toContain('user_id=789')

                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify(mockUser1),
                        },
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify(mockUser2),
                        },
                    ])
                }),
            )

            const results = await api.batch(
                api.workspaceUsers.getUserById({ workspaceId: 123, userId: 456 }, { batch: true }),
                api.workspaceUsers.getUserById({ workspaceId: 123, userId: 789 }, { batch: true }),
            )

            expect(results).toHaveLength(2)
            expect(results[0].code).toBe(200)
            expect(results[0].data.id).toBe(456)
            expect(results[0].data.name).toBe('User One')
            expect(results[1].code).toBe(200)
            expect(results[1].data.id).toBe(789)
            expect(results[1].data.name).toBe('User Two')
        })

        it('should handle empty batch', async () => {
            const results = await api.batch()
            expect(results).toEqual([])
        })

        it('should handle error responses in batch', async () => {
            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify({
                                id: 456,
                                name: 'User One',
                                email: 'user1@example.com',
                                user_type: 'USER',
                                short_name: 'U1',
                                timezone: 'UTC',
                                removed: false,
                                bot: false,
                                version: 1,
                            }),
                        },
                        {
                            code: 404,
                            headers: '',
                            body: JSON.stringify({ error: 'User not found' }),
                        },
                    ])
                }),
            )

            const results = await api.batch(
                api.workspaceUsers.getUserById({ workspaceId: 123, userId: 456 }, { batch: true }),
                api.workspaceUsers.getUserById({ workspaceId: 123, userId: 999 }, { batch: true }),
            )

            expect(results).toHaveLength(2)
            expect(results[0].code).toBe(200)
            expect(results[0].data.name).toBe('User One')
            expect(results[1].code).toBe(404)
            // Type assertion needed for error responses - error responses don't match the expected type
            expect((results[1].data as unknown as { error: string }).error).toBe('User not found')
        })

        it('should accept array of descriptors', () => {
            const descriptors = [
                api.workspaceUsers.getUserById({ workspaceId: 123, userId: 456 }, { batch: true }),
                api.workspaceUsers.getUserById({ workspaceId: 123, userId: 789 }, { batch: true }),
            ]
            expect(descriptors).toHaveLength(2)
            expect(descriptors[0].method).toBe('GET')
            expect(descriptors[0].url).toBe('workspace_users/getone')
        })
    })

    describe('chunked batch execution', () => {
        type ChunkingTestCase = {
            requestCount: number
            expectedChunks: number
            expectedChunkSizes: number[]
            idOffset: number
            description: string
            verifyOrder: boolean
        }

        type MockUser = {
            id: number
            name: string
            email: string
            user_type: string
            short_name: string
            timezone: string
            removed: boolean
            bot: boolean
            version: number
        }

        const basicChunkingTests: ChunkingTestCase[] = [
            {
                requestCount: 10,
                expectedChunks: 1,
                expectedChunkSizes: [10],
                idOffset: 400,
                description: 'should handle exactly 10 requests in a single batch',
                verifyOrder: true,
            },
            {
                requestCount: 11,
                expectedChunks: 2,
                expectedChunkSizes: [10, 1],
                idOffset: 500,
                description: 'should chunk 11 requests into two parallel batches',
                verifyOrder: true,
            },
            {
                requestCount: 25,
                expectedChunks: 3,
                expectedChunkSizes: [10, 10, 5],
                idOffset: 600,
                description: 'should chunk 25 requests into three parallel batches',
                verifyOrder: false, // Parallel execution may not preserve exact order due to MSW limitations
            },
            {
                requestCount: 33,
                expectedChunks: 4,
                expectedChunkSizes: [10, 10, 10, 3],
                idOffset: 1000,
                description: 'should chunk 33 requests into four parallel batches',
                verifyOrder: false,
            },
        ]

        test.each(basicChunkingTests)(
            '$description',
            async ({ requestCount, expectedChunks, expectedChunkSizes, idOffset, verifyOrder }) => {
                // Create mock users
                const mockUsers: MockUser[] = Array.from({ length: requestCount }, (_, i) => ({
                    id: idOffset + i,
                    name: `User ${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    user_type: 'USER',
                    short_name: `U${i + 1}`,
                    timezone: 'UTC',
                    removed: false,
                    bot: false,
                    version: 1,
                }))

                let batchCount = 0

                server.use(
                    http.post('https://api.twist.com/api/v3/batch', async ({ request }) => {
                        const body = await request.text()
                        const params = new URLSearchParams(body)
                        const requestsStr = params.get('requests')

                        expect(requestsStr).toBeDefined()
                        const requests = JSON.parse(requestsStr || '[]')

                        batchCount++

                        // Verify chunk size matches expected
                        const expectedSize = expectedChunkSizes.find(
                            (size) => size === requests.length,
                        )
                        expect(expectedSize).toBeDefined()

                        // Extract user IDs from the requests to return the correct users
                        const responseUsers = requests.map((req: { url: string }) => {
                            // Extract user_id from URL query params
                            const url = new URL(req.url)
                            const userId = Number.parseInt(
                                url.searchParams.get('user_id') || '0',
                                10,
                            )
                            return mockUsers.find((user) => user.id === userId) || mockUsers[0]
                        })

                        // Return appropriate responses based on the actual requested user IDs
                        return HttpResponse.json(
                            responseUsers.map((user: MockUser) => ({
                                code: 200,
                                headers: '',
                                body: JSON.stringify(user),
                            })),
                        )
                    }),
                )

                const results = await api.batch(
                    ...mockUsers.map((user) =>
                        api.workspaceUsers.getUserById(
                            { workspaceId: 123, userId: user.id },
                            { batch: true },
                        ),
                    ),
                )

                // Verify batch count and result length
                expect(batchCount).toBe(expectedChunks)
                expect(results).toHaveLength(requestCount)

                // Verify all results are successful
                results.forEach((result) => {
                    expect(result.code).toBe(200)
                    expect(result.data.id).toBeGreaterThanOrEqual(idOffset)
                    expect(result.data.id).toBeLessThan(idOffset + requestCount)
                })

                // Verify order preservation if expected
                if (verifyOrder) {
                    results.forEach((result, index) => {
                        expect(result.data.id).toBe(idOffset + index)
                        expect(result.data.name).toBe(`User ${index + 1}`)
                    })
                }
            },
        )

        it('should handle mixed success and failure across multiple chunks', async () => {
            // Create 15 requests to trigger chunking into 2 batches
            const mockUsers = Array.from({ length: 15 }, (_, i) => ({
                id: 700 + i,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                user_type: 'USER',
                short_name: `U${i + 1}`,
                timezone: 'UTC',
                removed: false,
                bot: false,
                version: 1,
            }))

            let batchCount = 0

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async ({ request }) => {
                    const body = await request.text()
                    const params = new URLSearchParams(body)
                    const requestsStr = params.get('requests')

                    expect(requestsStr).toBeDefined()
                    const requests = JSON.parse(requestsStr || '[]')

                    batchCount++

                    if (requests.length === 10) {
                        // First batch: mix of success and error
                        return HttpResponse.json([
                            ...Array.from({ length: 8 }, (_, i) => ({
                                code: 200,
                                headers: '',
                                body: JSON.stringify(mockUsers[i]),
                            })),
                            {
                                code: 404,
                                headers: '',
                                body: JSON.stringify({ error: 'User not found' }),
                            },
                            {
                                code: 500,
                                headers: '',
                                body: JSON.stringify({ error: 'Internal server error' }),
                            },
                        ])
                    } else if (requests.length === 5) {
                        // Second batch: all successful
                        return HttpResponse.json(
                            Array.from({ length: 5 }, (_, i) => ({
                                code: 200,
                                headers: '',
                                body: JSON.stringify(mockUsers[10 + i]),
                            })),
                        )
                    } else {
                        return HttpResponse.error()
                    }
                }),
            )

            const results = await api.batch(
                ...mockUsers.map((user) =>
                    api.workspaceUsers.getUserById(
                        { workspaceId: 123, userId: user.id },
                        { batch: true },
                    ),
                ),
            )

            expect(batchCount).toBe(2)
            expect(results).toHaveLength(15)

            // Count successful and error responses
            let successCount = 0
            let errorCount = 0

            results.forEach((result) => {
                if (result.code === 200) {
                    successCount++
                    expect(result.data.id).toBeGreaterThanOrEqual(700)
                } else if (result.code === 404 || result.code === 500) {
                    errorCount++
                }
            })

            expect(successCount).toBe(13) // 8 from first batch + 5 from second batch
            expect(errorCount).toBe(2) // 2 errors from first batch
        })

        it('should handle chunk-level failures gracefully', async () => {
            // Create 15 requests to trigger chunking
            const mockUsers = Array.from({ length: 15 }, (_, i) => ({
                id: 800 + i,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                user_type: 'USER',
                short_name: `U${i + 1}`,
                timezone: 'UTC',
                removed: false,
                bot: false,
                version: 1,
            }))

            let batchCount = 0

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async ({ request }) => {
                    batchCount++
                    const body = await request.text()
                    const params = new URLSearchParams(body)
                    const requestsStr = params.get('requests')

                    expect(requestsStr).toBeDefined()
                    const requests = JSON.parse(requestsStr || '[]')

                    if (batchCount === 1) {
                        // First batch fails completely
                        expect(requests).toHaveLength(10)
                        return HttpResponse.error()
                    } else {
                        // Second batch succeeds
                        expect(requests).toHaveLength(5)
                        return HttpResponse.json(
                            mockUsers.slice(10).map((user) => ({
                                code: 200,
                                headers: '',
                                body: JSON.stringify(user),
                            })),
                        )
                    }
                }),
            )

            const results = await api.batch(
                ...mockUsers.map((user) =>
                    api.workspaceUsers.getUserById(
                        { workspaceId: 123, userId: user.id },
                        { batch: true },
                    ),
                ),
            )

            expect(batchCount).toBe(2)
            expect(results).toHaveLength(15)

            // Verify first batch requests have error responses
            for (let i = 0; i < 10; i++) {
                expect(results[i].code).toBe(500)
                expect(results[i].data).toBe(null)
            }

            // Verify second batch requests are successful
            for (let i = 10; i < 15; i++) {
                expect(results[i].code).toBe(200)
                expect(results[i].data.id).toBe(800 + i)
            }
        })
    })

    describe('list endpoint batch schema transforms', () => {
        it('should apply InboxThreadSchema transform to inbox.getInbox batch results', async () => {
            const mockInboxThread = {
                id: 100,
                title: 'Inbox Thread',
                content: 'test',
                creator: 1,
                channel_id: 10,
                workspace_id: 5,
                comment_count: 0,
                last_updated_ts: 1609459200,
                pinned: false,
                posted_ts: 1609459200,
                snippet: 'test',
                snippet_creator: 1,
                starred: false,
                is_archived: false,
                in_inbox: true,
                closed: false,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify([mockInboxThread]),
                        },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.inbox.getInbox({ workspaceId: 5 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(100)
            expect(result.data[0].url).toBe('https://twist.com/a/5/ch/10/t/100/')
        })

        it('should apply CommentSchema transform to comments.getComments batch results', async () => {
            const mockComment = {
                id: 200,
                content: 'A comment',
                creator: 1,
                thread_id: 50,
                workspace_id: 5,
                channel_id: 10,
                posted_ts: 1609459200,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify([mockComment]),
                        },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.comments.getComments({ threadId: 50 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(200)
            expect(result.data[0].url).toBe('https://twist.com/a/5/ch/10/t/50/c/200')
        })

        it('should apply ConversationSchema transform to conversations.getConversations batch results', async () => {
            const mockConversation = {
                id: 300,
                workspace_id: 5,
                user_ids: [1, 2],
                last_obj_index: 3,
                snippet: 'hello',
                snippet_creators: [1],
                last_active_ts: 1609459200,
                archived: false,
                created_ts: 1609459200,
                creator: 1,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify([mockConversation]),
                        },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.conversations.getConversations({ workspaceId: 5 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(300)
            expect(result.data[0].url).toBe('https://twist.com/a/5/msg/300/')
        })

        it('should apply ConversationMessageSchema transform to conversationMessages.getMessages batch results', async () => {
            const mockMessage = {
                id: 400,
                content: 'A message',
                creator: 1,
                conversation_id: 300,
                workspace_id: 5,
                posted_ts: 1609459200,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify([mockMessage]),
                        },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.conversationMessages.getMessages({ conversationId: 300 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(400)
            expect(result.data[0].url).toBe('https://twist.com/a/5/msg/300/m/400')
        })

        it('should apply ThreadSchema transform to threads.getThreads batch results', async () => {
            const mockThread = {
                id: 500,
                title: 'Test Thread',
                content: 'test',
                creator: 1,
                channel_id: 10,
                workspace_id: 5,
                comment_count: 0,
                last_updated_ts: 1609459200,
                pinned: false,
                posted_ts: 1609459200,
                snippet: 'test',
                snippet_creator: 1,
                starred: false,
                is_archived: false,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify([mockThread]),
                        },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.threads.getThreads({ workspaceId: 5, channelId: 10 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(500)
            expect(result.data[0].url).toBe('https://twist.com/a/5/ch/10/t/500/')
        })

        it('should apply ChannelSchema transform to channels.getChannels batch results', async () => {
            const mockChannel = {
                id: 600,
                name: 'General',
                creator: 1,
                public: true,
                workspace_id: 5,
                archived: false,
                created_ts: 1609459200,
                version: 1,
            }

            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () => {
                    return HttpResponse.json([
                        {
                            code: 200,
                            headers: '',
                            body: JSON.stringify([mockChannel]),
                        },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.channels.getChannels({ workspaceId: 5 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(600)
            expect(result.data[0].url).toBe('https://twist.com/a/5/ch/600/')
        })
    })

    describe('getUserById with batch option', () => {
        it('should return descriptor when batch: true', () => {
            const descriptor = api.workspaceUsers.getUserById(
                { workspaceId: 123, userId: 456 },
                { batch: true },
            )

            expect(descriptor).toEqual({
                method: 'GET',
                url: 'workspace_users/getone',
                params: { id: 123, user_id: 456 },
                schema: expect.any(Object), // WorkspaceUserSchema
            })
        })

        it('should return promise when batch is not specified', async () => {
            server.use(
                http.get('https://api.twist.com/api/v4/workspace_users/getone', async () => {
                    return HttpResponse.json({
                        id: 456,
                        name: 'User One',
                        email: 'user1@example.com',
                        user_type: 'USER',
                        short_name: 'U1',
                        timezone: 'UTC',
                        removed: false,
                        bot: false,
                        version: 1,
                    })
                }),
            )

            const result = api.workspaceUsers.getUserById({ workspaceId: 123, userId: 456 })
            expect(result).toBeInstanceOf(Promise)

            const user = await result
            expect(user.id).toBe(456)
            expect(user.name).toBe('User One')
        })
    })
})
