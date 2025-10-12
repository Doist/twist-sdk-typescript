import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { CommentsClient } from './comments-client'

describe('CommentsClient', () => {
    let client: CommentsClient

    beforeEach(() => {
        client = new CommentsClient(TEST_API_TOKEN)
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
