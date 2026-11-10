import { describe, expect, it } from 'vitest'
import {
    completeReleaseRecord,
    assertPublishedRecord,
    assertRecordedBaseline,
} from './github-release-record.mjs'

const metadata = {
    schema: 1,
    name: '@todoist/twist-sdk',
    version: '3.0.1',
    sourceSha: 'a'.repeat(40),
    branch: 'main',
    notes: '[Posted by Jarvis]\n\nNotes',
    runId: '42',
    runAttempt: '1',
}
const files = [
    {
        name: 'todoist-twist-sdk-3.0.1.tgz',
        path: '/fixture/package',
        bytes: Buffer.from('original-tarball'),
    },
    {
        name: 'release.json',
        path: '/fixture/metadata',
        bytes: Buffer.from(JSON.stringify(metadata)),
    },
]
function fixture(initialAssets = 0) {
    const writes: string[] = []
    const release = {
        id: 7,
        tag_name: 'v3.0.1',
        target_commitish: metadata.sourceSha,
        prerelease: false,
        draft: true,
        published_at: null as string | null,
        body: metadata.notes,
    }
    const assets = files.slice(0, initialAssets).map((file, index) => ({
        id: index,
        name: file.name,
        state: 'uploaded',
        size: file.bytes.length,
    }))
    const api = {
        list: () => [release],
        get: () => release,
        assets: () => assets,
        tagSha: (): string | undefined => metadata.sourceSha,
        readAsset: (id: number) => files[id].bytes,
        createTag: (_tag: string, _sha: string): void => {
            throw new Error('must not retag')
        },
        createDraft: (_metadata: typeof metadata): typeof release => {
            throw new Error('must not recreate')
        },
        upload: (_id: number, name: string) => {
            writes.push(`upload:${name}`)
            const index = files.findIndex((file) => file.name === name)
            assets.push({ id: index, name, state: 'uploaded', size: files[index].bytes.length })
        },
        publish: () => {
            writes.push('publish')
            release.draft = false
            release.published_at = '2026-11-10T12:00:00Z'
        },
    }
    return { api, writes, release, assets }
}

describe('interrupted draft release recovery', () => {
    it('creates the first tag and draft from the original build before uploading and publishing', () => {
        const f = fixture()
        let exists = false
        let tag: string | undefined
        f.api.list = () => (exists ? [f.release] : [])
        f.api.tagSha = () => tag
        f.api.createTag = (name: string, sha: string) => {
            expect(name).toBe('v3.0.1')
            expect(sha).toBe(metadata.sourceSha)
            f.writes.push('tag')
            tag = sha
        }
        f.api.createDraft = (original: typeof metadata) => {
            expect(original).toEqual(metadata)
            f.writes.push('draft')
            exists = true
            return f.release
        }
        expect(completeReleaseRecord(f.api, metadata, files)).toBe(true)
        expect(f.writes).toEqual([
            'tag',
            'draft',
            ...files.map((f) => `upload:${f.name}`),
            'publish',
        ])
        expect(completeReleaseRecord(f.api, metadata, files)).toBe(false)
        expect(f.writes).toHaveLength(5)
    })
    it.each([0, 1, 2])('resumes an existing draft with %i uploaded assets', (count) => {
        const f = fixture(count)
        expect(completeReleaseRecord(f.api, metadata, files)).toBe(true)
        expect(f.writes).toEqual([
            ...files.slice(count).map((file) => `upload:${file.name}`),
            'publish',
        ])
        expect(() => assertPublishedRecord(f.api, f.release, metadata, files)).not.toThrow()
        f.writes.length = 0
        expect(completeReleaseRecord(f.api, metadata, files)).toBe(false)
        expect(f.writes).toEqual([])
    })
    it.each(['wrong commit', 'wrong prerelease', 'different bytes', 'incomplete upload'])(
        'rejects %s before any release write',
        (reason) => {
            const f = fixture(1)
            if (reason === 'wrong commit') f.api.tagSha = () => 'b'.repeat(40)
            if (reason === 'wrong prerelease') f.release.prerelease = true
            if (reason === 'different bytes')
                f.api.readAsset = () => Buffer.from('different-tarball')
            if (reason === 'incomplete upload') f.assets[0].state = 'starter'
            expect(() => completeReleaseRecord(f.api, metadata, files)).toThrow()
            expect(f.writes).toEqual([])
        },
    )
    it('never treats a draft with all assets as a published semantic baseline', async () => {
        const f = fixture(2)
        await expect(assertRecordedBaseline(f.api, 'v3.0.1')).rejects.toThrow(/still a draft/)
    })
    it('does not recreate a published record missing required original assets', () => {
        const f = fixture(0)
        f.release.draft = false
        f.release.published_at = '2026-11-10T12:00:00Z'
        expect(() => completeReleaseRecord(f.api, metadata, files)).toThrow(/Recover original run/)
        expect(f.writes).toEqual([])
    })
})
