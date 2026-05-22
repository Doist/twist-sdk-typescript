import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { mockWorkspaceUser, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { TwistApi } from '../twist-api'
import { WorkspaceUsersClient } from './workspace-users-client'

const removedWorkspaceUser = {
    ...mockWorkspaceUser,
    id: 2,
    name: 'Removed User',
    shortName: 'RU',
    removed: true,
}

describe('WorkspaceUsersClient', () => {
    let client: WorkspaceUsersClient

    beforeEach(() => {
        client = new WorkspaceUsersClient({ apiToken: TEST_API_TOKEN })
    })

    describe('getWorkspaceUsers', () => {
        it('excludes removed users by default and sends no server-side filter param', async () => {
            server.use(
                http.get(apiUrl('api/v4/workspace_users/get'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('123')
                    expect(url.searchParams.has('include_removed')).toBe(false)
                    expect(url.searchParams.has('with_removed')).toBe(false)
                    return HttpResponse.json([mockWorkspaceUser, removedWorkspaceUser])
                }),
            )

            const result = await client.getWorkspaceUsers({ workspaceId: 123 })

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe(mockWorkspaceUser.id)
            expect(result.some((user) => user.removed)).toBe(false)
        })

        it('includes removed users when includeRemoved is true', async () => {
            server.use(
                http.get(apiUrl('api/v4/workspace_users/get'), async () =>
                    HttpResponse.json([mockWorkspaceUser, removedWorkspaceUser]),
                ),
            )

            const result = await client.getWorkspaceUsers({
                workspaceId: 123,
                includeRemoved: true,
            })

            expect(result).toHaveLength(2)
            expect(result.map((user) => user.id)).toEqual([1, 2])
        })
    })

    describe('getWorkspaceUsers (batch)', () => {
        let api: TwistApi

        const activeUser = {
            id: 1,
            name: 'Active User',
            email: 'active@example.com',
            user_type: 'USER',
            short_name: 'AU',
            timezone: 'UTC',
            removed: false,
            bot: false,
            version: 1,
        }
        const removedUser = {
            ...activeUser,
            id: 2,
            name: 'Removed',
            short_name: 'RM',
            removed: true,
        }

        beforeEach(() => {
            api = new TwistApi(TEST_API_TOKEN)
        })

        it('excludes removed users by default', async () => {
            server.use(
                http.post('https://api.twist.com/api/v3/batch', async ({ request }) => {
                    const body = await request.text()
                    const requests = JSON.parse(new URLSearchParams(body).get('requests') || '[]')
                    expect(requests[0].url).toContain('workspace_users/get')
                    return HttpResponse.json([
                        { code: 200, headers: '', body: JSON.stringify([activeUser, removedUser]) },
                    ])
                }),
            )

            const [result] = await api.batch(
                api.workspaceUsers.getWorkspaceUsers({ workspaceId: 123 }, { batch: true }),
            )

            expect(result.code).toBe(200)
            expect(result.data).toHaveLength(1)
            expect(result.data[0].id).toBe(1)
        })

        it('includes removed users when includeRemoved is true', async () => {
            server.use(
                http.post('https://api.twist.com/api/v3/batch', async () =>
                    HttpResponse.json([
                        { code: 200, headers: '', body: JSON.stringify([activeUser, removedUser]) },
                    ]),
                ),
            )

            const [result] = await api.batch(
                api.workspaceUsers.getWorkspaceUsers(
                    { workspaceId: 123, includeRemoved: true },
                    { batch: true },
                ),
            )

            expect(result.data).toHaveLength(2)
            expect(result.data.map((user) => user.id)).toEqual([1, 2])
        })
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
