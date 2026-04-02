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
