import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ReactionsClient } from './reactions-client'

describe('ReactionsClient', () => {
    let client: ReactionsClient

    beforeEach(() => {
        client = new ReactionsClient(TEST_API_TOKEN)
    })

    describe('get', () => {
        it('should get reactions for a thread', async () => {
            const mockReactions = { '👍': [1, 2, 3], '❤️': [4, 5] }

            server.use(
                http.post(apiUrl('api/v3/reactions/get'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ thread_id: 789 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockReactions)
                }),
            )

            const result = await client.get({ threadId: 789 })
            expect(result).toEqual(mockReactions)
        })

        it('should get reactions for a comment', async () => {
            const mockReactions = { '🎉': [1, 2] }

            server.use(
                http.post(apiUrl('api/v3/reactions/get'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ comment_id: 206113 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockReactions)
                }),
            )

            const result = await client.get({ commentId: 206113 })
            expect(result).toEqual(mockReactions)
        })

        it('should get reactions for a message', async () => {
            server.use(
                http.post(apiUrl('api/v3/reactions/get'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ message_id: 514069 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            const result = await client.get({ messageId: 514069 })
            expect(result).toBeNull()
        })

        it('should throw error when no id provided', async () => {
            await expect(client.get({})).rejects.toThrow(
                'Must provide one of: threadId, commentId, or messageId',
            )
        })
    })
})
