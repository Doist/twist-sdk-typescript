import { vi } from 'vitest'
import {
    getAuthorizationUrl,
    getAuthStateParameter,
    getAuthToken,
    revokeAuthToken,
    TwistScope,
} from './authentication'
import { setupRestClientMock } from './testUtils/mocks'

describe('authentication', () => {
    describe('getAuthStateParameter', () => {
        it('should generate a UUID v4 state parameter', () => {
            const state = getAuthStateParameter()

            expect(typeof state).toBe('string')
            expect(state).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            )
        })

        it('should generate different states on multiple calls', () => {
            const state1 = getAuthStateParameter()
            const state2 = getAuthStateParameter()

            expect(state1).not.toBe(state2)
        })
    })

    describe('getAuthorizationUrl', () => {
        it('should generate correct authorization URL', () => {
            const clientId = 'test-client-id'
            const scopes: TwistScope[] = ['user:read', 'channels:write']
            const state = 'test-state'

            const url = getAuthorizationUrl(clientId, scopes, state)

            expect(url).toBe(
                'https://twist.com/oauth/authorize?client_id=test-client-id&response_type=code&scope=user%3Aread+channels%3Awrite&state=test-state',
            )
        })

        it('should include redirect URI if provided', () => {
            const clientId = 'test-client-id'
            const scopes: TwistScope[] = ['user:read']
            const state = 'test-state'
            const redirectUri = 'https://myapp.com/callback'

            const url = getAuthorizationUrl(clientId, scopes, state, redirectUri)

            expect(url).toContain('redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback')
        })

        it('should use custom base URL if provided', () => {
            const clientId = 'test-client-id'
            const scopes: TwistScope[] = ['user:read']
            const state = 'test-state'
            const baseUrl = 'https://custom.twist.com'

            const url = getAuthorizationUrl(clientId, scopes, state, undefined, baseUrl)

            expect(url).toContain('https://custom.twist.com/oauth/authorize')
        })

        it('should throw error if no scopes provided', () => {
            expect(() => {
                getAuthorizationUrl('client-id', [], 'state')
            }).toThrow('At least one scope value is required.')
        })
    })

    describe('getAuthToken', () => {
        let mockRequest: ReturnType<typeof setupRestClientMock>

        beforeEach(() => {
            const mockResponse = {
                accessToken: 'access-token-123',
                tokenType: 'Bearer',
                refreshToken: 'refresh-token-456',
                expiresIn: 3600,
            }
            mockRequest = setupRestClientMock(mockResponse, 200)
        })

        afterEach(() => {
            vi.clearAllMocks()
        })

        it('should exchange auth code for access token', async () => {
            const args = {
                clientId: 'client-id',
                clientSecret: 'client-secret',
                code: 'auth-code',
            }

            const result = await getAuthToken(args)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://twist.com/oauth/token',
                '',
                undefined,
                {
                    clientId: 'client-id',
                    clientSecret: 'client-secret',
                    code: 'auth-code',
                    grantType: 'authorization_code',
                },
            )
            expect(result.accessToken).toBe('access-token-123')
        })

        it('should include redirect URI in token request if provided', async () => {
            const args = {
                clientId: 'client-id',
                clientSecret: 'client-secret',
                code: 'auth-code',
                redirectUri: 'https://myapp.com/callback',
            }

            await getAuthToken(args)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://twist.com/oauth/token',
                '',
                undefined,
                expect.objectContaining({
                    redirectUri: 'https://myapp.com/callback',
                }),
            )
        })
    })

    describe('revokeAuthToken', () => {
        let mockRequest: ReturnType<typeof setupRestClientMock>

        beforeEach(() => {
            mockRequest = setupRestClientMock({}, 200)
        })

        afterEach(() => {
            vi.clearAllMocks()
        })

        it('should revoke access token', async () => {
            const args = {
                clientId: 'client-id',
                clientSecret: 'client-secret',
                accessToken: 'access-token',
            }

            const result = await revokeAuthToken(args)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://twist.com/oauth/revoke',
                '',
                undefined,
                {
                    clientId: 'client-id',
                    clientSecret: 'client-secret',
                    token: 'access-token',
                },
            )
            expect(result).toBe(true)
        })
    })
})
