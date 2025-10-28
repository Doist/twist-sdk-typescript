import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { mockWorkspaceUser, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { WorkspaceUsersClient } from './workspace-users-client'

describe('WorkspaceUsersClient', () => {
    let client: WorkspaceUsersClient

    beforeEach(() => {
        client = new WorkspaceUsersClient({ apiToken: TEST_API_TOKEN })
    })

    describe('getUserById', () => {
        it('should get user by id', async () => {
            server.use(
                http.get(apiUrl('api/v4/workspace_users/getone'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('123')
                    expect(url.searchParams.get('user_id')).toBe('456')
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockWorkspaceUser)
                }),
            )

            const result = await client.getUserById({ workspaceId: 123, userId: 456 })
            expect(result).toEqual(mockWorkspaceUser)
        })
    })

    describe('getUserByEmail', () => {
        it('should get user by email', async () => {
            server.use(
                http.get(apiUrl('api/v4/workspace_users/get_by_email'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('123')
                    expect(url.searchParams.get('email')).toBe('user@example.com')
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockWorkspaceUser)
                }),
            )

            const result = await client.getUserByEmail({
                workspaceId: 123,
                email: 'user@example.com',
            })
            expect(result).toEqual(mockWorkspaceUser)
        })
    })

    describe('getUserInfo', () => {
        it('should get user info', async () => {
            const mockUserInfo = {
                userId: 456,
                workspaceId: 123,
                role: 'admin',
                joinedDate: '2021-01-01',
            }

            server.use(
                http.get(apiUrl('api/v4/workspace_users/get_info'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('123')
                    expect(url.searchParams.get('user_id')).toBe('456')
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserInfo)
                }),
            )

            const result = await client.getUserInfo({ workspaceId: 123, userId: 456 })
            expect(result).toEqual(mockUserInfo)
        })
    })

    describe('getUserLocalTime', () => {
        it('should get user local time', async () => {
            const mockLocalTime = '2017-05-10 07:55:40'

            server.use(
                http.get(apiUrl('api/v4/workspace_users/get_local_time'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('123')
                    expect(url.searchParams.get('user_id')).toBe('456')
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockLocalTime)
                }),
            )

            const result = await client.getUserLocalTime({ workspaceId: 123, userId: 456 })
            expect(result).toBe(mockLocalTime)
        })
    })
})
