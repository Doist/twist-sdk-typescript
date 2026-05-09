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

    const { EnvHttpProxyAgent, interceptors } = await import('undici')

    // Compose the response-decompression interceptor so gzip/deflate/br/zstd
    // bodies are decoded before consumers parse them. Required on Node 24+:
    // attaching any custom dispatcher to the global `fetch` strips the
    // `content-encoding` header but does not actually decompress the body,
    // so callers receive raw gzipped bytes and `JSON.parse` fails.
    // See https://github.com/Doist/todoist-cli/issues/318.
    const decompress = silenceExperimentalWarning('DecompressInterceptor', () =>
        interceptors.decompress(),
    )

    return new EnvHttpProxyAgent(keepAliveOptions).compose(decompress)
}

// undici emits a one-time `ExperimentalWarning` the first time
// `interceptors.decompress()` is called. The interceptor is fully implemented
// and stable for our use case; suppress the warning so it does not leak to
// every consumer's stderr on the first request.
function silenceExperimentalWarning<T>(matchSubstring: string, fn: () => T): T {
    const originalEmit = process.emitWarning
    process.emitWarning = ((warning: string | Error, ...rest: unknown[]) => {
        const type = typeof rest[0] === 'string' ? rest[0] : undefined
        if (
            type === 'ExperimentalWarning' &&
            typeof warning === 'string' &&
            warning.includes(matchSubstring)
        ) {
            return
        }
        return (originalEmit as (...args: unknown[]) => void).call(process, warning, ...rest)
    }) as typeof process.emitWarning
    try {
        return fn()
    } finally {
        process.emitWarning = originalEmit
    }
}
