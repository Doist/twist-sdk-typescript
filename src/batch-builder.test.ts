import { HttpResponse, http } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import { server } from './testUtils/msw-setup'
import { TwistApi } from './twist-api'
import { TEST_API_TOKEN } from './testUtils/test-defaults'

describe('BatchBuilder', () => {
    let api: TwistApi

    beforeEach(() => {
        api = new TwistApi(TEST_API_TOKEN)
    })

    describe('createBatch', () => {
        it('should create a BatchBuilder instance', () => {
            const batch = api.createBatch()
            expect(batch).toBeDefined()
            expect(typeof batch.add).toBe('function')
            expect(typeof batch.execute).toBe('function')
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

                    const requests = JSON.parse(requestsStr!)
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

            const batch = api.createBatch()
            batch.add(() => api.workspaceUsers.getUserById(123, 456, { batch: true }))
            batch.add(() => api.workspaceUsers.getUserById(123, 789, { batch: true }))

            const results = await batch.execute()

            expect(results).toHaveLength(2)
            expect(results[0].code).toBe(200)
            expect(results[0].data.id).toBe(456)
            expect(results[0].data.name).toBe('User One')
            expect(results[1].code).toBe(200)
            expect(results[1].data.id).toBe(789)
            expect(results[1].data.name).toBe('User Two')
        })

        it('should handle empty batch', async () => {
            const batch = api.createBatch()
            const results = await batch.execute()
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

            const batch = api.createBatch()
            batch.add(() => api.workspaceUsers.getUserById(123, 456, { batch: true }))
            batch.add(() => api.workspaceUsers.getUserById(123, 999, { batch: true }))

            const results = await batch.execute()

            expect(results).toHaveLength(2)
            expect(results[0].code).toBe(200)
            expect(results[0].data.name).toBe('User One')
            expect(results[1].code).toBe(404)
            expect(results[1].data.error).toBe('User not found')
        })

        it('should support method chaining', () => {
            const batch = api.createBatch()
            const result = batch.add(() => api.workspaceUsers.getUserById(123, 456, { batch: true }))
            expect(result).toBe(batch) // Chaining returns the same instance
        })
    })

    describe('getUserById with batch option', () => {
        it('should return descriptor when batch: true', () => {
            const descriptor = api.workspaceUsers.getUserById(123, 456, { batch: true })

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

            const result = api.workspaceUsers.getUserById(123, 456)
            expect(result).toBeInstanceOf(Promise)

            const user = await result
            expect(user.id).toBe(456)
            expect(user.name).toBe('User One')
        })
    })
})
