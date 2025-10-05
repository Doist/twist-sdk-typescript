import { vi } from 'vitest'
import { isSuccess, paramsSerializer, request } from './rest-client'
import { server } from './testUtils/msw-setup'
import { TwistRequestError } from './types/errors'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe('restClient', () => {
    // Disable MSW for this test file since we're testing the low-level fetch behavior
    beforeAll(() => {
        server.close()
    })

    beforeEach(() => {
        mockFetch.mockClear()
    })

    describe('paramsSerializer', () => {
        it('should serialize simple params', () => {
            const params = {
                id: 1,
                name: 'test',
                active: true,
            }

            const result = paramsSerializer(params)
            expect(result).toBe('id=1&name=test&active=true')
        })

        it('should serialize arrays as comma-separated values', () => {
            const params = {
                ids: [1, 2, 3],
                tags: ['a', 'b'],
            }

            const result = paramsSerializer(params)
            expect(result).toBe('ids=1%2C2%2C3&tags=a%2Cb')
        })

        it('should skip null and undefined values', () => {
            const params = {
                id: 1,
                name: null,
                active: undefined,
                valid: 'yes',
            }

            const result = paramsSerializer(params)
            expect(result).toBe('id=1&valid=yes')
        })
    })

    describe('request', () => {
        it('should make successful GET request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve(JSON.stringify({ id: 1, user_name: 'test' })),
                headers: new Headers({ 'content-type': 'application/json' }),
            } as Response)

            const result = await request('GET', 'https://api.test.com', '/users', 'token')

            expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token',
                },
            })
            expect(result.data).toEqual({ id: 1, userName: 'test' })
            expect(result.status).toBe(200)
        })

        it('should make successful POST request with payload', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                text: () => Promise.resolve(JSON.stringify({ id: 1, created_at: '2023-01-01' })),
                headers: new Headers(),
            } as Response)

            const payload = { userName: 'test', isActive: true }
            await request('POST', 'https://api.test.com', '/users', 'token', payload)

            expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token',
                },
                body: JSON.stringify({ user_name: 'test', is_active: true }),
            })
        })

        it('should handle GET request with query parameters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve(JSON.stringify([])),
                headers: new Headers(),
            } as Response)

            const params = { workspaceId: 1, isActive: true }
            await request('GET', 'https://api.test.com', '/users', 'token', params)

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.test.com/users?workspace_id=1&is_active=true',
                expect.objectContaining({
                    method: 'GET',
                }),
            )
        })

        it('should throw TwistRequestError on HTTP error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: () => Promise.resolve(JSON.stringify({ error: 'Not found' })),
                headers: new Headers(),
            } as Response)

            await expect(request('GET', 'https://api.test.com', '/users', 'token')).rejects.toThrow(
                TwistRequestError,
            )
        })

        it('should retry on network errors', async () => {
            mockFetch
                .mockRejectedValueOnce(new TypeError('Network error'))
                .mockRejectedValueOnce(new TypeError('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    text: () => Promise.resolve(JSON.stringify({ id: 1 })),
                    headers: new Headers(),
                } as Response)

            const result = await request('GET', 'https://api.test.com', '/users', 'token')

            expect(mockFetch).toHaveBeenCalledTimes(3)
            expect(result.status).toBe(200)
        })
    })

    describe('isSuccess', () => {
        it('should return true for 2xx status codes', () => {
            expect(isSuccess({ status: 200, data: {}, headers: {} })).toBe(true)
            expect(isSuccess({ status: 201, data: {}, headers: {} })).toBe(true)
            expect(isSuccess({ status: 299, data: {}, headers: {} })).toBe(true)
        })

        it('should return false for non-2xx status codes', () => {
            expect(isSuccess({ status: 199, data: {}, headers: {} })).toBe(false)
            expect(isSuccess({ status: 300, data: {}, headers: {} })).toBe(false)
            expect(isSuccess({ status: 404, data: {}, headers: {} })).toBe(false)
            expect(isSuccess({ status: 500, data: {}, headers: {} })).toBe(false)
        })
    })
})
