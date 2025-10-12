import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { GroupsClient } from './groups-client'

describe('GroupsClient', () => {
    let client: GroupsClient

    beforeEach(() => {
        client = new GroupsClient(TEST_API_TOKEN)
    })

    describe('addUsers', () => {
        it('should add multiple users to group', async () => {
            server.use(
                http.post(apiUrl('api/v3/groups/add_users'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, user_ids: [456, 789, 101] })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.addUsers({ id: 123, userIds: [456, 789, 101] })
        })
    })

    describe('removeUser', () => {
        it('should remove a user from group', async () => {
            server.use(
                http.post(apiUrl('api/v3/groups/remove_user'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, user_id: 456 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.removeUser({ id: 123, userId: 456 })
        })
    })

    describe('removeUsers', () => {
        it('should remove multiple users from group', async () => {
            server.use(
                http.post(apiUrl('api/v3/groups/remove_users'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, user_ids: [456, 789, 101] })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.removeUsers({ id: 123, userIds: [456, 789, 101] })
        })
    })
})
