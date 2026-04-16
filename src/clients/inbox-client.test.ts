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
        it('should pass archive_filter param when provided', async () => {
            let capturedParams: URLSearchParams | undefined

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    capturedParams = new URL(request.url).searchParams
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123, archiveFilter: 'all' })

            expect(capturedParams).toBeDefined()
            expect(capturedParams?.get('archive_filter')).toBe('all')
            expect(capturedParams?.get('workspace_id')).toBe('123')
        })

        it('should not include archive_filter when not provided', async () => {
            let capturedParams: URLSearchParams | undefined

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    capturedParams = new URL(request.url).searchParams
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123 })

            expect(capturedParams).toBeDefined()
            expect(capturedParams?.has('archive_filter')).toBe(false)
        })

        it('should pass archived filter value', async () => {
            let capturedParams: URLSearchParams | undefined

            server.use(
                http.get(apiUrl('api/v3/inbox/get'), ({ request }) => {
                    capturedParams = new URL(request.url).searchParams
                    return HttpResponse.json([])
                }),
            )

            await client.getInbox({ workspaceId: 123, archiveFilter: 'archived' })

            expect(capturedParams).toBeDefined()
            expect(capturedParams?.get('archive_filter')).toBe('archived')
        })
    })
})
