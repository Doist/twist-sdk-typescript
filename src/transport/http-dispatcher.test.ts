import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { gzipSync } from 'node:zlib'
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

    it('retries dispatcher initialization after a failure', async () => {
        const MockEnvHttpProxyAgent = class {}
        let shouldReject = true

        vi.doMock('undici', () => ({
            EnvHttpProxyAgent: class extends MockEnvHttpProxyAgent {
                compose() {
                    return this
                }
                constructor() {
                    super()

                    if (shouldReject) {
                        shouldReject = false
                        throw new Error('init failed')
                    }
                }
            },
            interceptors: {
                decompress: () => (dispatch: unknown) => dispatch,
            },
        }))

        await expect(getDefaultDispatcher()).rejects.toThrow('init failed')

        const dispatcher = await getDefaultDispatcher()

        expect(dispatcher).toBeInstanceOf(MockEnvHttpProxyAgent)
    })

    it('decompresses gzip-encoded response bodies', async () => {
        const payload = { hello: 'world', nested: { value: 42 } }
        const compressed = gzipSync(Buffer.from(JSON.stringify(payload)))

        const httpServer: Server = await new Promise((resolve) => {
            const s = createServer((_req, res) => {
                res.writeHead(200, {
                    'content-type': 'application/json',
                    'content-encoding': 'gzip',
                    'content-length': String(compressed.length),
                })
                res.end(compressed)
            })
            s.listen(0, '127.0.0.1', () => resolve(s))
        })

        try {
            const { port } = httpServer.address() as AddressInfo
            const dispatcher = await getDefaultDispatcher()
            const response = await fetch(`http://127.0.0.1:${port}/`, {
                // @ts-expect-error - dispatcher is a valid Node fetch option not in TS lib types
                dispatcher,
            })
            const body = await response.text()

            expect(response.status).toBe(200)
            expect(body).toBe(JSON.stringify(payload))
            expect(JSON.parse(body)).toEqual(payload)
        } finally {
            await new Promise<void>((resolve) => httpServer.close(() => resolve()))
        }
    })

    it('does not emit ExperimentalWarning for decompress interceptor', async () => {
        const warnings: Array<{ name: string; message: string }> = []
        function listener(warning: Error): void {
            warnings.push({ name: warning.name, message: warning.message })
        }
        process.on('warning', listener)
        try {
            await getDefaultDispatcher()
        } finally {
            process.off('warning', listener)
        }

        const decompressWarnings = warnings.filter(
            (w) => w.name === 'ExperimentalWarning' && w.message.includes('DecompressInterceptor'),
        )
        expect(decompressWarnings).toEqual([])
    })
})
