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
        restoreProxyEnvironment()
        resetDefaultDispatcherForTests()
    })

    it('returns EnvHttpProxyAgent in Node', async () => {
        const dispatcher = await getDefaultDispatcher()

        expect(dispatcher).toBeInstanceOf(EnvHttpProxyAgent)
    })

    it('reuses the same dispatcher instance across calls', async () => {
        const firstDispatcher = await getDefaultDispatcher()
        const secondDispatcher = await getDefaultDispatcher()

        expect(secondDispatcher).toBe(firstDispatcher)
    })

    it('creates a new dispatcher after reset', async () => {
        const firstDispatcher = await getDefaultDispatcher()

        resetDefaultDispatcherForTests()

        const secondDispatcher = await getDefaultDispatcher()

        expect(secondDispatcher).not.toBe(firstDispatcher)
    })
})
