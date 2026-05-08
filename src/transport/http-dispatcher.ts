import type { Dispatcher } from 'undici'

// Use effectively-disabled keep-alive so short-lived CLI processes do not stay
// open waiting on idle sockets. Undici requires positive values, so we use 1ms.
const keepAliveOptions = {
    keepAliveTimeout: 1,
    keepAliveMaxTimeout: 1,
}

let defaultDispatcher: Dispatcher | undefined
let defaultDispatcherPromise: Promise<Dispatcher | undefined> | undefined

export async function getDefaultDispatcher(): Promise<Dispatcher | undefined> {
    if (defaultDispatcher) {
        return defaultDispatcher
    }

    if (!defaultDispatcherPromise) {
        defaultDispatcherPromise = createDefaultDispatcher()
            .then((dispatcher) => {
                defaultDispatcher = dispatcher
                return dispatcher
            })
            .catch((error) => {
                defaultDispatcher = undefined
                defaultDispatcherPromise = undefined
                throw error
            })
    }

    return defaultDispatcherPromise
}

export function resetDefaultDispatcherForTests(): void {
    defaultDispatcher = undefined
    defaultDispatcherPromise = undefined
}

function isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && typeof process.versions?.node === 'string'
}

export const PROXY_ENVIRONMENT_VARIABLES = [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
] as const

export type ProxyEnvironmentVariable = (typeof PROXY_ENVIRONMENT_VARIABLES)[number]

function hasProxyEnvironmentVariable(): boolean {
    return PROXY_ENVIRONMENT_VARIABLES.some((key) => {
        const value = process.env[key]
        return typeof value === 'string' && value.length > 0
    })
}

async function createDefaultDispatcher(): Promise<Dispatcher | undefined> {
    if (!isNodeEnvironment()) {
        return undefined
    }

    const { Agent, EnvHttpProxyAgent } = await import('undici')

    // Always supply a custom dispatcher so the keep-alive contract above is
    // honoured for every request. The proxy-aware variant is only needed when
    // proxy env vars are present; otherwise a plain `Agent` is enough and
    // avoids EnvHttpProxyAgent's per-request env-var lookup overhead.
    //
    // Compression note: on Node 24+, passing any custom dispatcher to global
    // `fetch` disables automatic gzip decompression. `http-client.ts` sends
    // `Accept-Encoding: identity` to opt out of compression entirely so the
    // body arrives plaintext regardless of which dispatcher we're using.
    return hasProxyEnvironmentVariable()
        ? new EnvHttpProxyAgent(keepAliveOptions)
        : new Agent(keepAliveOptions)
}
