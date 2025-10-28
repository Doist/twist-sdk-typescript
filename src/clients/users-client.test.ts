import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { UsersClient } from './users-client'

describe('UsersClient', () => {
    let client: UsersClient

    // API format response (snake_case)
    const mockUserApiResponse = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        short_name: 'TU',
        bot: false,
        timezone: 'America/New_York',
        removed: false,
        lang: 'en',
    }

    beforeEach(() => {
        client = new UsersClient({ apiToken: TEST_API_TOKEN })
    })

    describe('login', () => {
        it('should login user with credentials', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/login'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ email: 'user@example.com', password: 'secret' })
                    expect(request.headers.get('Authorization')).toBeNull()
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            const result = await client.login({
                email: 'user@example.com',
                password: 'secret',
            })
            expect(result.id).toBe(1)
            expect(result.email).toBe('test@example.com')
        })

        it('should login with setSessionCookie option', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/login'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        email: 'user@example.com',
                        password: 'secret',
                        set_session_cookie: false,
                    })
                    expect(request.headers.get('Authorization')).toBeNull()
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            await client.login({
                email: 'user@example.com',
                password: 'secret',
                setSessionCookie: false,
            })
        })
    })

    describe('logout', () => {
        it('should logout current user', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/logout'), async ({ request }) => {
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.logout()
        })
    })

    describe('getSessionUser', () => {
        it('should get current user', async () => {
            server.use(
                http.get(apiUrl('api/v3/users/get_session_user'), async ({ request }) => {
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            const result = await client.getSessionUser()
            expect(result.id).toBe(1)
            expect(result.email).toBe('test@example.com')
        })
    })

    describe('update', () => {
        it('should update user details', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/update'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ name: 'Updated Name', timezone: 'America/New_York' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            const result = await client.update({
                name: 'Updated Name',
                timezone: 'America/New_York',
            })
            expect(result.id).toBe(1)
        })

        it('should update user with away mode', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/update'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        away_mode: {
                            type: 'vacation',
                            date_from: '2024-01-01',
                            date_to: '2024-01-10',
                        },
                    })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            await client.update({
                awayMode: {
                    type: 'vacation',
                    dateFrom: '2024-01-01',
                    dateTo: '2024-01-10',
                },
            })
        })

        it('should update user with off days', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/update'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ off_days: [6, 7] })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            await client.update({
                offDays: [6, 7],
            })
        })
    })

    describe('updatePassword', () => {
        it('should update user password', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/update_password'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ new_password: 'newpassword123' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            const result = await client.updatePassword('newpassword123')
            expect(result.id).toBe(1)
        })
    })

    describe('invalidateToken', () => {
        it('should invalidate current token and return user with new token', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/invalidate_token'), async ({ request }) => {
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            const result = await client.invalidateToken()
            expect(result.id).toBe(1)
        })
    })

    describe('validateToken', () => {
        it('should validate a token', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/validate_token'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ token: 'sometoken123' })
                    expect(request.headers.get('Authorization')).toBeNull()
                    return HttpResponse.json(null)
                }),
            )

            await client.validateToken('sometoken123')
        })
    })

    describe('heartbeat', () => {
        it('should set user presence with platform', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/heartbeat'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ workspace_id: 123, platform: 'api' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.heartbeat(123, 'api')
        })

        it('should accept different platform values', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/heartbeat'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ workspace_id: 123, platform: 'mobile' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.heartbeat(123, 'mobile')
        })
    })

    describe('resetPresence', () => {
        it('should reset user presence', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/reset_presence'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ workspace_id: 123 })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.resetPresence(123)
        })
    })

    describe('resetPassword', () => {
        it('should send password reset email', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/reset_password'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ email: 'user@example.com' })
                    expect(request.headers.get('Authorization')).toBeNull()
                    return HttpResponse.json(null)
                }),
            )

            await client.resetPassword('user@example.com')
        })
    })

    describe('setPassword', () => {
        it('should set password with reset code', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/set_password'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        reset_code: 'resetcode123',
                        new_password: 'newpassword',
                    })
                    expect(request.headers.get('Authorization')).toBeNull()
                    return HttpResponse.json(mockUserApiResponse)
                }),
            )

            const result = await client.setPassword('resetcode123', 'newpassword')
            expect(result.id).toBe(1)
        })
    })

    describe('isConnectedToGoogle', () => {
        it('should check Google connection status', async () => {
            const mockResponse = {
                googleConnection: true,
                googleEmail: 'user@gmail.com',
            }
            server.use(
                http.get(apiUrl('api/v3/users/is_connected_to_google'), async ({ request }) => {
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockResponse)
                }),
            )

            const result = await client.isConnectedToGoogle()
            expect(result).toEqual(mockResponse)
        })
    })

    describe('disconnectGoogle', () => {
        it('should disconnect Google account', async () => {
            server.use(
                http.post(apiUrl('api/v3/users/disconnect_google'), async ({ request }) => {
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(null)
                }),
            )

            await client.disconnectGoogle()
        })
    })

    describe('deleteUser', () => {
        it('should delete user with password confirmation', async () => {
            const mockResponse = { status: 'ok' }
            server.use(
                http.post(apiUrl('api/v3/users/delete'), async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({ password: 'userpassword' })
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockResponse)
                }),
            )

            const result = await client.deleteUser('userpassword')
            expect(result).toEqual(mockResponse)
        })
    })
})
