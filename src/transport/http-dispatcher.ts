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
                if (dispatcher) {
                    defaultDispatcher = dispatcher
                } else {
                    // The "no proxy configured" result must not stick. If proxy
                    // env vars get populated later in the process, the next
                    // call needs to re-evaluate instead of being permanently
                    // pinned to the no-dispatcher branch.
                    defaultDispatcherPromise = undefined
                }
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

    // Only attach a dispatcher when a proxy is actually configured. Passing any
    // custom dispatcher to global `fetch` on Node 24+ disables automatic gzip
    // decompression, so `response.text()` returns raw gzipped bytes and every
    // JSON-parsing client breaks. Returning `undefined` lets native fetch handle
    // decompression as expected. NO_PROXY alone is meaningless without a proxy.
    if (!hasProxyEnvironmentVariable()) {
        return undefined
    }

    const { EnvHttpProxyAgent } = await import('undici')

    return new EnvHttpProxyAgent(keepAliveOptions)
}
