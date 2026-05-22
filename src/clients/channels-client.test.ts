import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ChannelsClient } from './channels-client'

const channelResponse = {
    id: 42,
    name: 'Engineering',
    creator: 1,
    public: true,
    workspace_id: 1,
    archived: false,
    created_ts: 1700000000,
    version: 1,
}

describe('ChannelsClient', () => {
    let client: ChannelsClient

    beforeEach(() => {
        client = new ChannelsClient({ apiToken: TEST_API_TOKEN })
    })

    it('roots entity links at the configured baseUrl (no double slash)', async () => {
        const customClient = new ChannelsClient({
            apiToken: TEST_API_TOKEN,
            baseUrl: 'https://twist.example.com/',
        })
        server.use(
            http.get('https://twist.example.com/api/v3/channels/get', () =>
                HttpResponse.json([channelResponse]),
            ),
        )

        const channels = await customClient.getChannels({ workspaceId: 1 })
        expect(channels[0].url).toBe('https://twist.example.com/a/1/ch/42/')
    })

    describe('favoriteChannel', () => {
        it('should favorite a channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/channels/favorite'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.favoriteChannel(123)
        })
    })

    describe('unfavoriteChannel', () => {
        it('should unfavorite a channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/channels/unfavorite'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.unfavoriteChannel(123)
        })
    })

    describe('addUser', () => {
        it('should add a user to channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/channels/add_user'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, user_id: 456 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.addUser({ id: 123, userId: 456 })
        })
    })

    describe('addUsers', () => {
        it('should add multiple users to channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/channels/add_users'), async ({ request }) => {
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
        it('should remove a user from channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/channels/remove_user'), async ({ request }) => {
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
        it('should remove multiple users from channel', async () => {
            server.use(
                http.post(apiUrl('api/v3/channels/remove_users'), async ({ request }) => {
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
