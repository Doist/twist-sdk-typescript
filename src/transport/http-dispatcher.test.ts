import { EnvHttpProxyAgent } from 'undici'
import { getDefaultDispatcher, resetDefaultDispatcherForTests } from './http-dispatcher'

const proxyEnvironmentKeys = [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'no_proxy',
] as const

type ProxyEnvironmentKey = (typeof proxyEnvironmentKeys)[number]

const originalProxyEnvironment = Object.fromEntries(
    proxyEnvironmentKeys.map((key) => [key, process.env[key]]),
) as Record<ProxyEnvironmentKey, string | undefined>

function clearProxyEnvironment(): void {
    proxyEnvironmentKeys.forEach((key) => {
        delete process.env[key]
    })
}

function restoreProxyEnvironment(): void {
    proxyEnvironmentKeys.forEach((key) => {
        const value = originalProxyEnvironment[key]
        if (value === undefined) {
            delete process.env[key]
            return
        }

        process.env[key] = value
    })
}

describe('httpDispatcher', () => {
    beforeEach(() => {
        clearProxyEnvironment()
        resetDefaultDispatcherForTests()
    })

    afterEach(() => {
        vi.doUnmock('undici')
        restoreProxyEnvironment()
        resetDefaultDispatcherForTests()
    })

    it('returns undefined when no proxy env var is set', async () => {
        const dispatcher = await getDefaultDispatcher()

        expect(dispatcher).toBeUndefined()
    })

    it('returns undefined when only NO_PROXY is set', async () => {
        process.env.NO_PROXY = 'api.twist.com'

        const dispatcher = await getDefaultDispatcher()

        expect(dispatcher).toBeUndefined()
    })

    it('returns undefined when a proxy env var is empty', async () => {
        process.env.HTTPS_PROXY = ''

        const dispatcher = await getDefaultDispatcher()

        expect(dispatcher).toBeUndefined()
    })

    it.each(['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'] as const)(
        'returns EnvHttpProxyAgent when %s is set',
        async (envVar) => {
            process.env[envVar] = 'http://localhost:8080'

            const dispatcher = await getDefaultDispatcher()

            expect(dispatcher).toBeInstanceOf(EnvHttpProxyAgent)
        },
    )

    it('reuses the same dispatcher instance across calls', async () => {
        process.env.HTTPS_PROXY = 'http://localhost:8080'

        const firstDispatcher = await getDefaultDispatcher()
        const secondDispatcher = await getDefaultDispatcher()

        expect(secondDispatcher).toBe(firstDispatcher)
    })

    it('creates a new dispatcher after reset', async () => {
        process.env.HTTPS_PROXY = 'http://localhost:8080'

        const firstDispatcher = await getDefaultDispatcher()

        resetDefaultDispatcherForTests()

        const secondDispatcher = await getDefaultDispatcher()

        expect(secondDispatcher).not.toBe(firstDispatcher)
    })

    it('retries dispatcher initialization after a failure', async () => {
        process.env.HTTPS_PROXY = 'http://localhost:8080'

        const MockEnvHttpProxyAgent = class {}
        let shouldReject = true

        vi.doMock('undici', () => ({
            EnvHttpProxyAgent: class extends MockEnvHttpProxyAgent {
                constructor() {
                    super()

                    if (shouldReject) {
                        shouldReject = false
                        throw new Error('init failed')
                    }
                }
            },
        }))

        await expect(getDefaultDispatcher()).rejects.toThrow('init failed')

        const dispatcher = await getDefaultDispatcher()

        expect(dispatcher).toBeInstanceOf(MockEnvHttpProxyAgent)
    })
})
