/**
 * Integration tests demonstrating custom fetch with Obsidian's requestUrl API.
 *
 * These tests validate that the Twist API SDK works correctly in Obsidian plugins,
 * which have restricted networking that requires using Obsidian's requestUrl instead
 * of standard fetch.
 */

import type { RequestUrlParam, RequestUrlResponse } from 'obsidian'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTwistBaseUri } from './consts/endpoints'
import { HttpResponse, http } from './testUtils/msw-handlers'
import { server } from './testUtils/msw-setup'
import { createObsidianFetchAdapter } from './testUtils/obsidian-fetch-adapter'
import { TEST_API_TOKEN } from './testUtils/test-defaults'
import { TwistApi } from './twist-api'

// API format responses (snake_case, timestamps as Unix epoch)
const mockUserApiResponse = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    short_name: 'TU',
    bot: false,
    timezone: 'America/New_York',
    removed: false,
    lang: 'en',
}

const mockChannelApiResponse = {
    id: 1,
    name: 'general',
    creator: 1,
    public: true,
    workspace_id: 1,
    archived: false,
    created_ts: 1609459200,
    version: 0,
}

const mockThreadApiResponse = {
    id: 1,
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

describe('Obsidian Custom Fetch Integration', () => {
    // Mock Obsidian's requestUrl function
    const mockRequestUrl =
        vi.fn<(request: RequestUrlParam | string) => Promise<RequestUrlResponse>>()

    beforeEach(() => {
        vi.clearAllMocks()

        // Configure mock to call through to MSW and return Obsidian-shaped responses
        mockRequestUrl.mockImplementation(async (request: RequestUrlParam | string) => {
            const params = typeof request === 'string' ? { url: request } : request
            const url = params.url
            const method = params.method || 'GET'
            const headers = params.headers || {}
            const body = params.body

            // Make actual request to MSW handlers
            const response = await fetch(url, {
                method,
                headers,
                body: body as BodyInit,
            })

            // Clone response to read body twice
            const responseClone = response.clone()
            const text = await response.text()
            let json: unknown
            try {
                json = text ? JSON.parse(text) : null
            } catch {
                json = null
            }

            // Return Obsidian-shaped response (properties, not methods)
            const headersObj: Record<string, string> = {}
            responseClone.headers.forEach((value, key) => {
                headersObj[key] = value
            })

            return {
                status: responseClone.status,
                headers: headersObj,
                arrayBuffer: await responseClone.arrayBuffer(),
                json,
                text,
            }
        })
    })

    describe('GET requests', () => {
        it('should get current user (simple GET, no parameters)', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(mockUserApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const user = await api.users.getSessionUser()

            expect(user.id).toBe(1)
            expect(user.email).toBe('test@example.com')
            expect(mockRequestUrl).toHaveBeenCalledWith({
                url: `${getTwistBaseUri()}users/get_session_user`,
                method: 'GET',
                headers: expect.objectContaining({
                    Authorization: `Bearer ${TEST_API_TOKEN}`,
                }),
                body: undefined,
                throw: false,
            })
        })

        it('should get channel by id (GET with query parameter)', async () => {
            const channelId = 1
            server.use(
                http.get(`${getTwistBaseUri()}channels/getone`, ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe(String(channelId))
                    return HttpResponse.json(mockChannelApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const channel = await api.channels.getChannel(channelId)

            expect(channel.id).toBe(1)
            expect(channel.name).toBe('general')
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('id=1'),
                    method: 'GET',
                }),
            )
        })

        it('should get threads with filters (GET with multiple query parameters)', async () => {
            const channelId = 1
            const threads = [mockThreadApiResponse]

            server.use(
                http.get(`${getTwistBaseUri()}threads/get`, ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('channel_id')).toBe(String(channelId))
                    return HttpResponse.json(threads, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const result = await api.threads.getThreads({ workspaceId: 1, channelId })

            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Test Thread')
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('channel_id=1'),
                    method: 'GET',
                }),
            )
        })
    })

    describe('POST requests', () => {
        it('should create channel (POST with JSON body)', async () => {
            const newChannel = {
                workspaceId: 1,
                name: 'New Channel',
                description: 'A test channel',
            }

            server.use(
                http.post(`${getTwistBaseUri()}channels/add`, async ({ request }) => {
                    const body = await request.json()
                    expect(body).toMatchObject({
                        workspace_id: newChannel.workspaceId,
                        name: newChannel.name,
                        description: newChannel.description,
                    })
                    return HttpResponse.json(mockChannelApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const channel = await api.channels.createChannel(newChannel)

            expect(channel.id).toBe(1)
            expect(channel.name).toBe('general')
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `${getTwistBaseUri()}channels/add`,
                    method: 'POST',
                    body: expect.any(String),
                }),
            )
        })

        it('should create thread (POST with complex JSON body)', async () => {
            const newThread = {
                channelId: 1,
                title: 'New Thread',
                content: 'This is a new thread',
            }

            server.use(
                http.post(`${getTwistBaseUri()}threads/add`, async ({ request }) => {
                    const body = await request.json()
                    expect(body).toMatchObject({
                        channel_id: newThread.channelId,
                        title: newThread.title,
                        content: newThread.content,
                    })
                    return HttpResponse.json(mockThreadApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const thread = await api.threads.createThread(newThread)

            expect(thread.id).toBe(1)
            expect(thread.title).toBe('Test Thread')
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `${getTwistBaseUri()}threads/add`,
                    method: 'POST',
                    body: expect.any(String),
                }),
            )
        })

        it('should update user (POST with body)', async () => {
            const updates = { name: 'Updated Name', timezone: 'Europe/London' }

            server.use(
                http.post(`${getTwistBaseUri()}users/update`, async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual(updates)
                    return HttpResponse.json(
                        { ...mockUserApiResponse, ...updates },
                        { status: 200 },
                    )
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const user = await api.users.update(updates)

            expect(user.name).toBe('Updated Name')
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `${getTwistBaseUri()}users/update`,
                    method: 'POST',
                    body: JSON.stringify(updates),
                }),
            )
        })
    })

    describe('DELETE requests (POST method)', () => {
        it('should delete thread (POST returning void)', async () => {
            const threadId = 1

            server.use(
                http.post(`${getTwistBaseUri()}threads/remove`, async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: threadId })
                    return new HttpResponse(null, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const result = await api.threads.deleteThread(threadId)

            expect(result).toBeUndefined()
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `${getTwistBaseUri()}threads/remove`,
                    method: 'POST',
                }),
            )
        })

        it('should delete channel (POST returning void)', async () => {
            const channelId = 1

            server.use(
                http.post(`${getTwistBaseUri()}channels/remove`, async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: channelId })
                    return new HttpResponse(null, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const result = await api.channels.deleteChannel(channelId)

            expect(result).toBeUndefined()
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `${getTwistBaseUri()}channels/remove`,
                    method: 'POST',
                }),
            )
        })
    })

    describe('Headers and Authorization', () => {
        it('should pass authorization header correctly', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(mockUserApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await api.users.getSessionUser()

            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: `Bearer ${TEST_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    }),
                }),
            )
        })

        it('should handle custom headers', async () => {
            let capturedHeaders: Record<string, string> | undefined

            mockRequestUrl.mockImplementationOnce(async (request: RequestUrlParam | string) => {
                const params = typeof request === 'string' ? { url: request } : request
                capturedHeaders = params.headers

                const url = params.url
                const method = params.method || 'GET'
                const headers = params.headers || {}
                const body = params.body

                const response = await fetch(url, {
                    method,
                    headers,
                    body: body as BodyInit,
                })

                const responseClone = response.clone()
                const text = await response.text()
                let json: unknown
                try {
                    json = text ? JSON.parse(text) : null
                } catch {
                    json = null
                }

                const headersObj: Record<string, string> = {}
                responseClone.headers.forEach((value, key) => {
                    headersObj[key] = value
                })

                return {
                    status: responseClone.status,
                    headers: headersObj,
                    arrayBuffer: await responseClone.arrayBuffer(),
                    json,
                    text,
                }
            })

            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(mockUserApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await api.users.getSessionUser()

            expect(capturedHeaders).toBeDefined()
            expect(capturedHeaders?.Authorization).toBe(`Bearer ${TEST_API_TOKEN}`)
        })
    })

    describe('URL encoding and parameter handling', () => {
        it('should properly encode query parameters', async () => {
            const workspaceId = 123

            server.use(
                http.get(`${getTwistBaseUri()}channels/get`, ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('workspace_id')).toBe(String(workspaceId))
                    return HttpResponse.json([mockChannelApiResponse], { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await api.channels.getChannels({ workspaceId })

            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('workspace_id=123'),
                }),
            )
        })

        it('should handle multiple query parameters', async () => {
            const channelId = 1
            const archived = false

            server.use(
                http.get(`${getTwistBaseUri()}threads/get`, ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('channel_id')).toBe(String(channelId))
                    return HttpResponse.json([mockThreadApiResponse], { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await api.threads.getThreads({ workspaceId: 1, channelId, archived })

            const call = mockRequestUrl.mock.calls[0][0] as RequestUrlParam
            expect(call.url).toContain('channel_id=1')
            expect(call.url).toContain('archived=false')
        })
    })

    describe('Error handling', () => {
        it('should handle HTTP 401 errors correctly', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(
                        {
                            error_code: 'INVALID_TOKEN',
                            error_string: 'Invalid authentication token',
                        },
                        { status: 401 },
                    )
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await expect(api.users.getSessionUser()).rejects.toThrow()

            // Verify throw: false was set (so we can handle errors)
            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    throw: false,
                }),
            )
        })

        it('should handle HTTP 404 errors correctly', async () => {
            const channelId = 999

            server.use(
                http.get(`${getTwistBaseUri()}channels/getone`, () => {
                    return HttpResponse.json(
                        {
                            error_code: 'CHANNEL_NOT_FOUND',
                            error_string: 'Channel not found',
                        },
                        { status: 404 },
                    )
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await expect(api.channels.getChannel(channelId)).rejects.toThrow()
        })

        it('should handle HTTP 500 errors correctly', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(
                        {
                            error_code: 'INTERNAL_ERROR',
                            error_string: 'Internal server error',
                        },
                        { status: 500 },
                    )
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await expect(api.users.getSessionUser()).rejects.toThrow()
        })

        it('should handle network errors', async () => {
            // Mock a network error by rejecting the mockRequestUrl promise
            mockRequestUrl.mockRejectedValueOnce(new Error('Network error'))

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            // The error should propagate through the custom fetch adapter
            await expect(api.users.getSessionUser()).rejects.toThrow()
        })
    })

    describe('Response parsing', () => {
        it('should correctly parse JSON responses', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(mockUserApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const user = await api.users.getSessionUser()

            expect(user.id).toBe(1)
            expect(user.email).toBe('test@example.com')
            expect(user.name).toBe('Test User')
        })

        it('should handle empty responses correctly', async () => {
            server.use(
                http.post(`${getTwistBaseUri()}threads/remove`, () => {
                    return new HttpResponse(null, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const result = await api.threads.deleteThread(1)

            expect(result).toBeUndefined()
        })

        it('should handle array responses correctly', async () => {
            const channels = [
                mockChannelApiResponse,
                { ...mockChannelApiResponse, id: 2, name: 'Another Channel' },
            ]

            server.use(
                http.get(`${getTwistBaseUri()}channels/get`, () => {
                    return HttpResponse.json(channels, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const result = await api.channels.getChannels({ workspaceId: 1 })

            expect(result).toHaveLength(2)
            expect(result[0].name).toBe('general')
            expect(result[1].name).toBe('Another Channel')
        })
    })

    describe('Different HTTP methods', () => {
        it('should handle GET requests', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(mockUserApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await api.users.getSessionUser()

            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'GET',
                }),
            )
        })

        it('should handle POST requests', async () => {
            server.use(
                http.post(`${getTwistBaseUri()}channels/add`, () => {
                    return HttpResponse.json(mockChannelApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            await api.channels.createChannel({ workspaceId: 1, name: 'Test' })

            expect(mockRequestUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'POST',
                }),
            )
        })
    })

    describe('Real-world scenarios', () => {
        it('should handle a complete workflow: create channel, create thread, delete thread', async () => {
            // Step 1: Create channel
            server.use(
                http.post(`${getTwistBaseUri()}channels/add`, () => {
                    return HttpResponse.json(mockChannelApiResponse, { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const channel = await api.channels.createChannel({
                workspaceId: 1,
                name: 'Test Channel',
            })
            expect(channel.id).toBe(1)
            expect(channel.name).toBe('general')

            // Step 2: Create thread
            server.use(
                http.post(`${getTwistBaseUri()}threads/add`, () => {
                    return HttpResponse.json(mockThreadApiResponse, { status: 200 })
                }),
            )

            const thread = await api.threads.createThread({
                channelId: channel.id,
                title: 'Test Thread',
                content: 'Test content',
            })
            expect(thread.id).toBe(1)
            expect(thread.title).toBe('Test Thread')

            // Step 3: Delete thread
            server.use(
                http.post(`${getTwistBaseUri()}threads/remove`, () => {
                    return new HttpResponse(null, { status: 200 })
                }),
            )

            await api.threads.deleteThread(thread.id)

            // Verify all three calls were made
            expect(mockRequestUrl).toHaveBeenCalledTimes(3)
        })

        it('should handle concurrent requests', async () => {
            server.use(
                http.get(`${getTwistBaseUri()}users/get_session_user`, () => {
                    return HttpResponse.json(mockUserApiResponse, { status: 200 })
                }),
                http.get(`${getTwistBaseUri()}channels/get`, () => {
                    return HttpResponse.json([mockChannelApiResponse], { status: 200 })
                }),
            )

            const api = new TwistApi(TEST_API_TOKEN, {
                customFetch: createObsidianFetchAdapter(mockRequestUrl),
            })

            const [user, channels] = await Promise.all([
                api.users.getSessionUser(),
                api.channels.getChannels({ workspaceId: 1 }),
            ])

            expect(user.id).toBe(1)
            expect(user.email).toBe('test@example.com')
            expect(channels).toHaveLength(1)
            expect(channels[0].name).toBe('general')
            expect(mockRequestUrl).toHaveBeenCalledTimes(2)
        })
    })
})
