import { HttpResponse, http } from 'msw'
import {
    getAuthorizationUrl,
    getAuthStateParameter,
    getAuthToken,
    revokeAuthToken,
    TwistScope,
} from './authentication'
import { server } from './testUtils/msw-setup'

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
        it('should exchange auth code for access token', async () => {
            const mockResponse = {
                access_token: 'access-token-123',
                token_type: 'Bearer',
                refresh_token: 'refresh-token-456',
                expires_in: 3600,
            }

            server.use(
                http.post('https://twist.com/oauth/token', async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        client_id: 'client-id',
                        client_secret: 'client-secret',
                        code: 'auth-code',
                        grant_type: 'authorization_code',
                    })
                    return HttpResponse.json(mockResponse)
                }),
            )

            const args = {
                clientId: 'client-id',
                clientSecret: 'client-secret',
                code: 'auth-code',
            }

            const result = await getAuthToken(args)
            expect(result.accessToken).toBe('access-token-123')
            expect(result.tokenType).toBe('Bearer')
            expect(result.refreshToken).toBe('refresh-token-456')
            expect(result.expiresIn).toBe(3600)
        })

        it('should include redirect URI in token request if provided', async () => {
            const mockResponse = {
                access_token: 'access-token-123',
                token_type: 'Bearer',
                refresh_token: 'refresh-token-456',
                expires_in: 3600,
            }

            server.use(
                http.post('https://twist.com/oauth/token', async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        client_id: 'client-id',
                        client_secret: 'client-secret',
                        code: 'auth-code',
                        grant_type: 'authorization_code',
                        redirect_uri: 'https://myapp.com/callback',
                    })
                    return HttpResponse.json(mockResponse)
                }),
            )

            const args = {
                clientId: 'client-id',
                clientSecret: 'client-secret',
                code: 'auth-code',
                redirectUri: 'https://myapp.com/callback',
            }

            await getAuthToken(args)
        })
    })

    describe('revokeAuthToken', () => {
        it('should revoke access token', async () => {
            server.use(
                http.post('https://twist.com/oauth/revoke', async ({ request }) => {
                    const body = await request.json()
                    expect(body).toEqual({
                        client_id: 'client-id',
                        client_secret: 'client-secret',
                        token: 'access-token',
                    })
                    return HttpResponse.json({})
                }),
            )

            const args = {
                clientId: 'client-id',
                clientSecret: 'client-secret',
                accessToken: 'access-token',
            }

            const result = await revokeAuthToken(args)
            expect(result).toBe(true)
        })
    })
})
