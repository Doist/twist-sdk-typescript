import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { SearchClient } from './search-client'

describe('SearchClient', () => {
    let client: SearchClient

    const emptyResponse = {
        items: [],
        has_more: false,
        is_plan_restricted: false,
    }

    beforeEach(() => {
        client = new SearchClient({ apiToken: TEST_API_TOKEN })
    })

    describe('search', () => {
        it('sends the query and workspace_id when both are provided', async () => {
            server.use(
                http.get(apiUrl('api/v3/search'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('query')).toBe('deadline')
                    expect(url.searchParams.get('workspace_id')).toBe('1')
                    expect(url.searchParams.get('mention_self')).toBeNull()
                    return HttpResponse.json(emptyResponse)
                }),
            )

            await client.search({ query: 'deadline', workspaceId: 1 })
        })

        it('omits the query param when only mentionSelf is set', async () => {
            server.use(
                http.get(apiUrl('api/v3/search'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.has('query')).toBe(false)
                    expect(url.searchParams.get('workspace_id')).toBe('1')
                    expect(url.searchParams.get('mention_self')).toBe('true')
                    return HttpResponse.json(emptyResponse)
                }),
            )

            await client.search({ workspaceId: 1, mentionSelf: true })
        })

        it('forwards both query and mentionSelf when both are provided', async () => {
            server.use(
                http.get(apiUrl('api/v3/search'), ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('query')).toBe('release')
                    expect(url.searchParams.get('mention_self')).toBe('true')
                    return HttpResponse.json(emptyResponse)
                }),
            )

            await client.search({ query: 'release', workspaceId: 1, mentionSelf: true })
        })
    })
})
