import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { InboxClient } from './inbox-client'

describe('InboxClient', () => {
    let client: InboxClient

    beforeEach(() => {
        client = new InboxClient({ apiToken: TEST_API_TOKEN })
    })

    describe('getInbox', () => {
        it('should send newerThan as newer_than_ts query parameter', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('newer_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('workspace_id')).toBe('123')
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123, newerThan: date })
        })

        it('should send olderThan as older_than_ts query parameter', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('older_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('workspace_id')).toBe('123')
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123, olderThan: date })
        })

        it('should support deprecated since param as newer_than_ts', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('newer_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('workspace_id')).toBe('123')
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123, since: date })
        })

        it('should support deprecated until param as older_than_ts', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('older_than_ts')).toBe(String(expectedTs))
                    expect(url.searchParams.get('workspace_id')).toBe('123')
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123, until: date })
        })
    })

    describe('archiveAll', () => {
        it('should send olderThan as older_than_ts parameter', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.post(apiUrl('api/v3/inbox/archive_all'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        workspace_id: 123,
                        older_than_ts: expectedTs,
                    })
                    return HttpResponse.json(null)
                }),
            )

            await client.archiveAll({ workspaceId: 123, olderThan: date })
        })

        it('should support deprecated until param', async () => {
            const date = new Date('2024-06-15T12:00:00Z')
            const expectedTs = Math.floor(date.getTime() / 1000)

            server.use(
                http.post(apiUrl('api/v3/inbox/archive_all'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        workspace_id: 123,
                        older_than_ts: expectedTs,
                    })
                    return HttpResponse.json(null)
                }),
            )

            await client.archiveAll({ workspaceId: 123, until: date })
        })
    })
})
