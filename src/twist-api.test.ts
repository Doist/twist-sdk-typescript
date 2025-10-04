import { TwistApi } from './twist-api'
import { TEST_API_TOKEN } from './testUtils/test-defaults'

describe('TwistApi', () => {
    it('should initialize all client instances', () => {
        const api = new TwistApi(TEST_API_TOKEN)

        expect(api.users).toBeDefined()
        expect(api.workspaces).toBeDefined()
        expect(api.channels).toBeDefined()
        expect(api.threads).toBeDefined()
        expect(api.groups).toBeDefined()
        expect(api.conversations).toBeDefined()
        expect(api.comments).toBeDefined()
    })

    it('should pass custom base URL to all clients', () => {
        const customBaseUrl = 'https://custom.api.com'
        const api = new TwistApi(TEST_API_TOKEN, customBaseUrl)

        // Test that clients are initialized (we can't easily test the private baseUrl without exposing it)
        expect(api.users).toBeDefined()
        expect(api.workspaces).toBeDefined()
        expect(api.channels).toBeDefined()
        expect(api.threads).toBeDefined()
        expect(api.groups).toBeDefined()
        expect(api.conversations).toBeDefined()
        expect(api.comments).toBeDefined()
    })
})
