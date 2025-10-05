import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ConversationsClient } from './conversations-client'

describe('ConversationsClient', () => {
    let client: ConversationsClient

    // API format response (snake_case with timestamps)
    const mockConversationApiResponse = {
        id: 123,
        workspace_id: 1,
        user_ids: [1, 2],
        message_count: 1,
        last_obj_index: 0,
        snippet: 'Hello there',
        snippet_creators: [1],
        last_active_ts: 1609459200,
        archived: false,
        created_ts: 1609459200,
        creator: 1,
    }

    beforeEach(() => {
        client = new ConversationsClient(TEST_API_TOKEN)
    })

    describe('updateConversation', () => {
        it('should update conversation with title only', async () => {
            server.use(
                http.post(apiUrl('api/v3/conversations/update'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, title: 'New Title' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockConversationApiResponse)
                }),
            )

            const result = await client.updateConversation(123, 'New Title')
            expect(result.id).toBe(123)
            expect(result.lastActive).toBeInstanceOf(Date)
            expect(result.created).toBeInstanceOf(Date)
        })

        it('should update conversation with archived flag', async () => {
            server.use(
                http.post(apiUrl('api/v3/conversations/update'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, title: 'New Title', archived: true })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockConversationApiResponse)
                }),
            )

            await client.updateConversation(123, 'New Title', true)
        })
    })

    describe('addUsers', () => {
        it('should add multiple users to conversation', async () => {
            server.use(
                http.post(apiUrl('api/v3/conversations/add_users'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, user_ids: [456, 789, 101] })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.addUsers(123, [456, 789, 101])
        })
    })

    describe('removeUsers', () => {
        it('should remove multiple users from conversation', async () => {
            server.use(
                http.post(apiUrl('api/v3/conversations/remove_users'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, user_ids: [456, 789, 101] })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.removeUsers(123, [456, 789, 101])
        })
    })

    describe('muteConversation', () => {
        it('should mute conversation for specified minutes', async () => {
            server.use(
                http.post(apiUrl('api/v3/conversations/mute'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, minutes: 30 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockConversationApiResponse)
                }),
            )

            const result = await client.muteConversation(123, 30)
            expect(result.id).toBe(123)
            expect(result.lastActive).toBeInstanceOf(Date)
        })
    })

    describe('unmuteConversation', () => {
        it('should unmute conversation', async () => {
            server.use(
                http.post(apiUrl('api/v3/conversations/unmute'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockConversationApiResponse)
                }),
            )

            const result = await client.unmuteConversation(123)
            expect(result.id).toBe(123)
            expect(result.created).toBeInstanceOf(Date)
        })
    })
})
