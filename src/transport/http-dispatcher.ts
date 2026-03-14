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

async function createDefaultDispatcher(): Promise<Dispatcher | undefined> {
    if (!isNodeEnvironment()) {
        return undefined
    }

    const { EnvHttpProxyAgent } = await import('undici')

    return new EnvHttpProxyAgent(keepAliveOptions)
}
