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
