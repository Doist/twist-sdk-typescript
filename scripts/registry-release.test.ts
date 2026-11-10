import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { publishArtifact } from './registry-release.mjs'

const metadata = { name: '@todoist/twist-sdk', version: '3.0.1', integrity: 'sha512-reviewed' }
const environment = {
    GH_PACKAGES_TOKEN: 'fixture-gh',
    GH_TOKEN: 'fixture-api',
    SOURCE_GH_TOKEN: 'fixture-read',
    NODE_AUTH_TOKEN: 'fixture-old',
    NPM_CONFIG_REGISTRY: 'https://wrong.invalid',
}
function fixture(
    copies: Record<string, unknown> = {},
    mirror = 'public',
    registry = 'readable',
    channels: Record<string, string> = {},
) {
    const events: { args: string[]; options: any }[] = []
    let ghReads = 0
    let rootReads = 0
    const io = {
        execFileSync(_bin: string, args: string[], options: any) {
            events.push({ args, options })
            if (args[0] === 'api' && mirror === 'inaccessible') throw new Error('GitHub API 404')
            if (args[0] === 'api')
                return JSON.stringify({
                    visibility: mirror,
                    repository: { full_name: 'todoist/twist-sdk-typescript', id: 1069607965 },
                })
            if (args[0] === 'config')
                return readFileSync(options.env.NPM_CONFIG_USERCONFIG, 'utf8')
                    .split('\n')[0]
                    .slice('registry='.length)
            if (args[0] === 'publish')
                copies[args.some((x) => x.includes('npm.pkg.github.com')) ? 'github' : 'npmjs'] =
                    metadata.integrity
            return ''
        },
        spawnSync(_bin: string, args: string[], options: any) {
            events.push({ args, options })
            if (args[0] === 'whoami') return { status: 0, stdout: 'fixture-reader' }
            const destination = args.some((x) => x.includes('npm.pkg.github.com'))
                ? 'github'
                : 'npmjs'
            if (destination === 'github' && registry === '404')
                return { status: 1, stdout: '{"error":{"code":"E404"}}' }
            if (args[2] === '--json') {
                rootReads++
                if (registry === 'late-404' && rootReads > 1)
                    return { status: 1, stdout: '{"error":{"code":"E404"}}' }
                const document = {
                    name: metadata.name,
                    'dist-tags': {
                        latest:
                            channels.github ||
                            (copies.github === metadata.integrity ? metadata.version : '2.2.0'),
                        alpha: '0.1.0-alpha.5',
                    },
                }
                const variants: Record<string, unknown> = {
                    malformed: {},
                    'missing-tags': { name: metadata.name },
                    'empty-tags': { name: metadata.name, 'dist-tags': {} },
                    'array-tags': { name: metadata.name, 'dist-tags': [] },
                    'bad-version': { name: metadata.name, 'dist-tags': { latest: 42 } },
                    'wrong-name': { ...document, name: '@other/twist-sdk' },
                }
                return { status: 0, stdout: JSON.stringify(variants[registry] || document) }
            }
            if (args[2] === 'dist-tags')
                return {
                    status: 0,
                    stdout: JSON.stringify({
                        latest:
                            channels[destination] ||
                            (copies[destination] === metadata.integrity ? '3.0.1' : '3.0.0'),
                    }),
                }
            if (destination === 'github') ghReads++
            const value = copies[destination]
            if (value === 'E401') return { status: 1, stdout: '{"error":{"code":"E401"}}' }
            if (value === 'late-conflict' && ghReads > 1)
                return { status: 0, stdout: '"sha512-conflict"' }
            return value === undefined || value === 'late-conflict'
                ? { status: 1, stdout: '{"error":{"code":"E404"}}' }
                : { status: 0, stdout: JSON.stringify(value) }
        },
    }
    const execute = (command = 'publish', destination = 'npmjs') =>
        publishArtifact(
            { metadata, tarball: '/fixture/reviewed.tgz', destination, command, tag: 'latest' },
            io,
            environment,
        )
    return { execute, events }
}

describe('same artifact dual registry publication', () => {
    it.each(['sha512-conflict', 'E401'])(
        'stops before any write when the other mirror returns %s',
        (github) => {
            const f = fixture({ github })
            expect(() => f.execute()).toThrow()
            expect(f.events.filter((e) => ['publish', 'login'].includes(e.args[0]))).toEqual([])
        },
    )
    it('checks the other mirror even when the selected destination already matches', () => {
        const f = fixture({ npmjs: metadata.integrity, github: 'sha512-conflict' })
        expect(() => f.execute()).toThrow()
    })
    it('skips identical copies and only writes the missing destination', () => {
        const both = fixture({ npmjs: metadata.integrity, github: metadata.integrity })
        expect(both.execute().status).toBe('already-matches')
        expect(both.events.some((e) => e.args[0] === 'publish')).toBe(false)
        const missing = fixture({ github: metadata.integrity })
        expect(missing.execute().status).toBe('published')
        const writes = missing.events.filter((e) => e.args[0] === 'publish')
        expect(writes.map((e) => e.args)).toEqual([
            [
                'publish',
                '/fixture/reviewed.tgz',
                '--ignore-scripts',
                '--tag=latest',
                '--registry=https://registry.npmjs.org/',
                '--provenance=false',
                '--access=public',
            ],
        ])
    })
    it('preflights again after interactive login and before publish', () => {
        const f = fixture({ github: 'late-conflict' })
        expect(() => f.execute('bootstrap-npm')).toThrow()
        expect(f.events.some((e) => e.args[0] === 'login')).toBe(true)
        expect(f.events.some((e) => e.args[0] === 'publish')).toBe(false)
    })
    it('lets login and publish prompt for 2FA without exposing GitHub credentials to npm', () => {
        const f = fixture()
        f.execute('bootstrap-npm')
        for (const event of f.events.filter((e) => ['login', 'publish'].includes(e.args[0]))) {
            expect(event.options.stdio).toBe('inherit')
            expect(event.options.env.GH_PACKAGES_TOKEN).toBeUndefined()
            expect(event.options.env.GH_TOKEN).toBeUndefined()
            expect(event.options.env.SOURCE_GH_TOKEN).toBeUndefined()
            expect(event.options.env.NODE_AUTH_TOKEN).toBeUndefined()
            expect(event.options.env.NPM_CONFIG_REGISTRY).toBeUndefined()
        }
    })
})

describe('existing public mirror visibility gate', () => {
    it.each(['publish npmjs', 'publish github', 'bootstrap-npm npmjs'])(
        'requires a readable public identity before %s',
        (operation) => {
            const [command, destination] = operation.split(' ')
            for (const visibility of ['inaccessible', 'private', 'internal']) {
                const f = fixture({}, visibility)
                expect(() => f.execute(command, destination)).toThrow()
                expect(f.events.some((event) => ['login', 'publish'].includes(event.args[0]))).toBe(
                    false,
                )
                expect(f.events.some((event) => event.args[0] === 'view')).toBe(false)
            }
        },
    )
})

describe('registry readability is separate from public REST metadata and identity', () => {
    it.each(['publish npmjs', 'publish github', 'bootstrap-npm npmjs'])(
        'rejects all registry404s before any write during %s',
        (operation) => {
            const [command, destination] = operation.split(' ')
            const f = fixture({}, 'public', '404')
            expect(() => f.execute(command, destination)).toThrow()
            expect(
                f.events.filter((event) => ['login', 'publish'].includes(event.args[0])),
            ).toEqual([])
        },
    )
    it.each(['malformed', 'missing-tags', 'empty-tags', 'array-tags', 'bad-version', 'wrong-name'])(
        'rejects %s metadata even when REST and whoami succeed',
        (registry) => {
            const f = fixture({}, 'public', registry)
            expect(() => f.execute()).toThrow()
            expect(f.events.some((event) => event.args[0] === 'publish')).toBe(false)
        },
    )
    it('accepts an absent version only on a readable existing registry package', () => {
        const f = fixture({ npmjs: metadata.integrity })
        expect(f.execute('publish', 'github').status).toBe('published')
        expect(f.events.filter((event) => event.args[0] === 'publish')).toHaveLength(1)
    })
    it.each(['9.0.0-.', '1.2.3-next..1', '1.2.3-next.01', '1.2.3+bad..build'])(
        'rejects malformed SemVer %s before every publication path',
        (version) => {
            for (const operation of ['publish npmjs', 'publish github', 'bootstrap-npm npmjs']) {
                const [command, destination] = operation.split(' ')
                const f = fixture({}, 'public', 'readable', { github: version })
                expect(() => f.execute(command, destination)).toThrow()
                expect(
                    f.events.filter((event) => ['login', 'publish'].includes(event.args[0])),
                ).toEqual([])
            }
        },
    )
    it.each(['npmjs', 'github'])(
        'does not advance %s when the opposite registry channel is newer',
        (destination) => {
            const opposite = destination === 'npmjs' ? 'github' : 'npmjs'
            const f = fixture({}, 'public', 'readable', { [opposite]: '3.0.2' })
            expect(() => f.execute('publish', destination)).toThrow(/downgrade/)
            expect(f.events.some((event) => event.args[0] === 'publish')).toBe(false)
        },
    )
})

it('rechecks root registry readability after interactive login before publishing', () => {
    const f = fixture({}, 'public', 'late-404')
    expect(() => f.execute('bootstrap-npm')).toThrow(/registry package is unreadable/)
    expect(f.events.some((event) => event.args[0] === 'login')).toBe(true)
    expect(f.events.some((event) => event.args[0] === 'publish')).toBe(false)
})
