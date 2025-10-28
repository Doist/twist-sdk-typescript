import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { WorkspacesClient } from './workspaces-client'

describe('WorkspacesClient', () => {
    let client: WorkspacesClient

    // API format response (snake_case with timestamps)
    const mockWorkspaceApiResponse = {
        id: 123,
        name: 'Test Workspace',
        creator: 1,
        created_ts: 1609459200,
    }

    const mockChannelApiResponse = {
        id: 456,
        name: 'general',
        creator: 1,
        public: true,
        workspace_id: 123,
        archived: false,
        created_ts: 1609459200,
        version: 0,
    }

    beforeEach(() => {
        client = new WorkspacesClient({ apiToken: TEST_API_TOKEN })
    })

    describe('getDefaultWorkspace', () => {
        it('should get the default workspace', async () => {
            server.use(
                http.get(apiUrl('api/v3/workspaces/get_default'), async ({ request }) => {
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockWorkspaceApiResponse)
                }),
            )

            const result = await client.getDefaultWorkspace()
            expect(result.id).toBe(123)
            expect(result.created).toBeInstanceOf(Date)
        })
    })

    describe('createWorkspace', () => {
        it('should create a workspace with name only', async () => {
            server.use(
                http.post(apiUrl('api/v3/workspaces/add'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ name: 'New Workspace' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockWorkspaceApiResponse)
                }),
            )

            const result = await client.createWorkspace('New Workspace')
            expect(result.id).toBe(123)
            expect(result.created).toBeInstanceOf(Date)
        })

        it('should create a workspace with tempId', async () => {
            server.use(
                http.post(apiUrl('api/v3/workspaces/add'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ name: 'New Workspace', temp_id: 999 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockWorkspaceApiResponse)
                }),
            )

            await client.createWorkspace('New Workspace', 999)
        })
    })

    describe('updateWorkspace', () => {
        it('should update workspace name', async () => {
            server.use(
                http.post(apiUrl('api/v3/workspaces/update'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, name: 'Updated Name' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockWorkspaceApiResponse)
                }),
            )

            const result = await client.updateWorkspace(123, 'Updated Name')
            expect(result.id).toBe(123)
            expect(result.created).toBeInstanceOf(Date)
        })
    })

    describe('removeWorkspace', () => {
        it('should remove workspace with password confirmation', async () => {
            server.use(
                http.post(apiUrl('api/v3/workspaces/remove'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ id: 123, current_password: 'mypassword' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.removeWorkspace(123, 'mypassword')
        })
    })

    describe('getPublicChannels', () => {
        it('should get public channels for workspace', async () => {
            server.use(
                http.get(apiUrl('api/v3/workspaces/get_public_channels'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('123')
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json([mockChannelApiResponse])
                }),
            )

            const result = await client.getPublicChannels(123)
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe(456)
            expect(result[0].created).toBeInstanceOf(Date)
        })
    })
})
