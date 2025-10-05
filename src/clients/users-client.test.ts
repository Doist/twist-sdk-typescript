import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { mockUser, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { UsersClient } from './users-client'

describe('UsersClient', () => {
    let client: UsersClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new UsersClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockUser)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('login', () => {
        it('should login user with credentials', async () => {
            const result = await client.login({
                email: 'user@example.com',
                password: 'secret',
            })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/login',
                undefined,
                { email: 'user@example.com', password: 'secret' },
            )
            expect(result).toEqual(mockUser)
        })

        it('should login with setSessionCookie option', async () => {
            await client.login({
                email: 'user@example.com',
                password: 'secret',
                setSessionCookie: false,
            })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/login',
                undefined,
                { email: 'user@example.com', password: 'secret', setSessionCookie: false },
            )
        })
    })

    describe('logout', () => {
        it('should logout current user', async () => {
            await client.logout()

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/logout',
                TEST_API_TOKEN,
            )
        })
    })

    describe('getSessionUser', () => {
        it('should get current user', async () => {
            const result = await client.getSessionUser()

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v3/',
                'users/get_session_user',
                TEST_API_TOKEN,
            )
            expect(result).toEqual(mockUser)
        })
    })

    describe('update', () => {
        it('should update user details', async () => {
            const result = await client.update({
                name: 'Updated Name',
                timezone: 'America/New_York',
            })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/update',
                TEST_API_TOKEN,
                { name: 'Updated Name', timezone: 'America/New_York' },
            )
            expect(result).toEqual(mockUser)
        })

        it('should update user with away mode', async () => {
            await client.update({
                awayMode: {
                    type: 'vacation',
                    dateFrom: '2024-01-01',
                    dateTo: '2024-01-10',
                },
            })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/update',
                TEST_API_TOKEN,
                {
                    awayMode: {
                        type: 'vacation',
                        dateFrom: '2024-01-01',
                        dateTo: '2024-01-10',
                    },
                },
            )
        })

        it('should update user with off days', async () => {
            await client.update({
                offDays: [6, 7],
            })

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/update',
                TEST_API_TOKEN,
                { offDays: [6, 7] },
            )
        })
    })

    describe('updatePassword', () => {
        it('should update user password', async () => {
            const result = await client.updatePassword('newpassword123')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/update_password',
                TEST_API_TOKEN,
                { newPassword: 'newpassword123' },
            )
            expect(result).toEqual(mockUser)
        })
    })

    describe('invalidateToken', () => {
        it('should invalidate current token and return user with new token', async () => {
            const result = await client.invalidateToken()

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/invalidate_token',
                TEST_API_TOKEN,
            )
            expect(result).toEqual(mockUser)
        })
    })

    describe('validateToken', () => {
        it('should validate a token', async () => {
            await client.validateToken('sometoken123')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/validate_token',
                undefined,
                { token: 'sometoken123' },
            )
        })
    })

    describe('heartbeat', () => {
        it('should set user presence with platform', async () => {
            await client.heartbeat(123, 'api')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/heartbeat',
                TEST_API_TOKEN,
                { workspaceId: 123, platform: 'api' },
            )
        })

        it('should accept different platform values', async () => {
            await client.heartbeat(123, 'mobile')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/heartbeat',
                TEST_API_TOKEN,
                { workspaceId: 123, platform: 'mobile' },
            )
        })
    })

    describe('resetPresence', () => {
        it('should reset user presence', async () => {
            await client.resetPresence(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/reset_presence',
                TEST_API_TOKEN,
                { workspaceId: 123 },
            )
        })
    })

    describe('resetPassword', () => {
        it('should send password reset email', async () => {
            await client.resetPassword('user@example.com')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/reset_password',
                undefined,
                { email: 'user@example.com' },
            )
        })
    })

    describe('setPassword', () => {
        it('should set password with reset code', async () => {
            const result = await client.setPassword('resetcode123', 'newpassword')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/set_password',
                undefined,
                { resetCode: 'resetcode123', newPassword: 'newpassword' },
            )
            expect(result).toEqual(mockUser)
        })
    })

    describe('isConnectedToGoogle', () => {
        it('should check Google connection status', async () => {
            const mockResponse = {
                googleConnection: true,
                googleEmail: 'user@gmail.com',
            }
            mockRequest.mockResolvedValue({
                status: 200,
                data: mockResponse,
                headers: {},
            })

            const result = await client.isConnectedToGoogle()

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v3/',
                'users/is_connected_to_google',
                TEST_API_TOKEN,
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('disconnectGoogle', () => {
        it('should disconnect Google account', async () => {
            await client.disconnectGoogle()

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/disconnect_google',
                TEST_API_TOKEN,
            )
        })
    })

    describe('deleteUser', () => {
        it('should delete user with password confirmation', async () => {
            const mockResponse = { status: 'ok' }
            mockRequest.mockResolvedValue({
                status: 200,
                data: mockResponse,
                headers: {},
            })

            const result = await client.deleteUser('userpassword')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'users/delete',
                TEST_API_TOKEN,
                { password: 'userpassword' },
            )
            expect(result).toEqual(mockResponse)
        })
    })
})
