import { describe, expect, it } from 'vitest'
import {
    assertStableSourceRecorded,
    finishReleaseRecords,
    recordStableSource,
} from './source-release-record.mjs'

const metadata = {
    branch: 'main',
    version: '3.0.1',
    sourceSha: 'a'.repeat(40),
    sha256: 'b'.repeat(64),
    notes: '[Posted by Jarvis]\n\n## 3.0.1\n\nRetained release notes.',
}
function fixture() {
    const original = JSON.stringify({ name: '@todoist/twist-sdk', version: '3.0.0' })
    let head = 'c'.repeat(40)
    let files: Record<string, string> = {
        'CHANGELOG.md': 'User-maintained introduction.\n\n## 3.0.0\n\nHistorical notes.\n',
        'package.json': JSON.stringify({
            name: '@todoist/twist-sdk',
            version: '3.0.0',
            description: 'User edit',
            dependencies: { updated: '2.0.0' },
        }),
        'package-lock.json': JSON.stringify({
            name: '@todoist/twist-sdk',
            version: '3.0.0',
            packages: {
                '': {
                    name: '@todoist/twist-sdk',
                    version: '3.0.0',
                    dependencies: { updated: '2.0.0' },
                },
                'node_modules/updated': { version: '2.0.0', integrity: 'unchanged' },
            },
        }),
    }
    const writes: { parent: string; files: Record<string, string>; message: string }[] = []
    let pending: Record<string, string>
    let applied = 0
    const api = {
        head: () => head,
        compare: () => ({ status: 'ahead', merge_base_commit: { sha: metadata.sourceSha } }),
        read: (path: string, sha: string) => (sha === metadata.sourceSha ? original : files[path]),
        commit: (parent: string, updates: Record<string, string>, message: string) => {
            writes.push({ parent, files: updates, message })
            pending = updates
            return 'd'.repeat(40)
        },
        advance: (sha: string) => {
            applied++
            head = sha
            files = pending
        },
    }
    return {
        api,
        writes,
        get files() {
            return files
        },
        get applied() {
            return applied
        },
    }
}

describe('stable source records from original published artifacts', () => {
    it('updates only source release fields atop fresh main, preserving user and lock history', () => {
        const f = fixture()
        const oldChangelog = f.files['CHANGELOG.md']
        const result = recordStableSource(f.api, metadata)
        expect(result).toEqual({
            status: 'recorded',
            sha: 'd'.repeat(40),
            buildSha: metadata.sourceSha,
        })
        expect(f.writes[0].parent).toBe('c'.repeat(40))
        expect(Object.keys(f.writes[0].files).sort()).toEqual([
            'CHANGELOG.md',
            'package-lock.json',
            'package.json',
        ])
        expect(f.writes[0].message).toContain('[skip ci]')
        expect(f.writes[0].message).toContain(metadata.sourceSha)
        expect(JSON.parse(f.files['package.json'])).toMatchObject({
            version: '3.0.1',
            description: 'User edit',
            dependencies: { updated: '2.0.0' },
        })
        expect(JSON.parse(f.files['package-lock.json'])).toMatchObject({
            version: '3.0.1',
            packages: {
                '': { version: '3.0.1' },
                'node_modules/updated': { integrity: 'unchanged' },
            },
        })
        expect(f.files['CHANGELOG.md'].endsWith(oldChangelog)).toBe(true)
        expect(f.files['CHANGELOG.md']).toContain('Retained release notes.')
        expect(() => assertStableSourceRecorded(f.api, metadata)).not.toThrow()
        expect(recordStableSource(f.api, metadata)).toEqual({ status: 'already-recorded' })
        expect(f.writes).toHaveLength(1)
        expect(f.applied).toBe(1)
    })
    it('recovers a lost main-update response without duplicate commits or changelog entries', () => {
        const f = fixture()
        const advance = f.api.advance
        f.api.advance = (sha) => {
            advance(sha)
            throw new Error('response lost')
        }
        expect(() => recordStableSource(f.api, metadata)).toThrow('response lost')
        expect(recordStableSource(f.api, metadata).status).toBe('already-recorded')
        expect(f.writes).toHaveLength(1)
    })
    it('stops on concurrent main/protection failure without forcing a ref', () => {
        const f = fixture()
        f.api.advance = () => {
            throw new Error('non-fast-forward')
        }
        expect(() => recordStableSource(f.api, metadata)).toThrow('non-fast-forward')
        expect(f.applied).toBe(0)
        expect(JSON.parse(f.files['package.json']).version).toBe('3.0.0')
        expect(() => assertStableSourceRecorded(f.api, metadata)).toThrow(/incomplete/)
    })
    it('does not overwrite an intervening version decision', () => {
        const f = fixture()
        const read = f.api.read
        f.api.read = (path, sha) =>
            read(path, sha).replaceAll('3.0.0', sha === metadata.sourceSha ? '3.0.0' : '3.1.0')
        expect(() => recordStableSource(f.api, metadata)).toThrow(/Main version changed/)
        expect(f.writes).toEqual([])
    })
    it('leaves prerelease source files alone', () => {
        const f = fixture()
        expect(
            recordStableSource(f.api, { ...metadata, branch: 'next', version: '3.1.0-next.1' }),
        ).toEqual({ status: 'prerelease-skipped' })
        expect(f.writes).toEqual([])
    })
})

describe('release recording order', () => {
    function operations(fail = '') {
        const calls: string[] = []
        const call = (name: string) => {
            calls.push(name)
            if (name === fail) throw new Error(`failed ${name}`)
        }
        return {
            calls,
            io: {
                verifyArtifact: () => call('artifact'),
                checkRegistry: (destination: string) => {
                    call(destination)
                    return { tags: { latest: metadata.version, next: '3.1.0-next.1' } }
                },
                completeRelease: () => {
                    call('release')
                    return true
                },
                recordChannel: () => call('channel'),
                recordSource: () => {
                    call('source')
                    return { status: 'recorded' }
                },
            },
        }
    }
    it('records stable source only after both copies, completed release, and channel notes', () => {
        const f = operations()
        finishReleaseRecords(metadata, f.io)
        expect(f.calls).toEqual(['artifact', 'npmjs', 'github', 'release', 'channel', 'source'])
    })
    it.each(['artifact', 'npmjs', 'github', 'release', 'channel'])(
        'does not record source after %s failure',
        (failure) => {
            const f = operations(failure)
            expect(() => finishReleaseRecords(metadata, f.io)).toThrow(`failed ${failure}`)
            expect(f.calls).not.toContain('source')
        },
    )
    it('rejects normal channel mismatch before any release/source write', () => {
        const f = operations()
        f.io.checkRegistry = () => ({ tags: { latest: '3.0.2', next: '3.1.0-next.1' } })
        expect(() => finishReleaseRecords(metadata, f.io)).toThrow(/both normal channels/)
        expect(f.calls).toEqual(['artifact'])
    })
    it('records next release and notes without stable commitback', () => {
        const f = operations()
        finishReleaseRecords({ ...metadata, branch: 'next', version: '3.1.0-next.1' }, f.io)
        expect(f.calls).toEqual(['artifact', 'npmjs', 'github', 'release', 'channel'])
    })
})
