import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compareRetainedArtifact } from './artifact-source.mjs'

const sourceRun = { id: 42, run_attempt: 2, head_sha: 'a'.repeat(40), head_branch: 'main' }
function fixture() {
    const directory = mkdtempSync(join(tmpdir(), 'artifact-fixture-'))
    const filename = 'todoist-twist-sdk-3.0.1.tgz'
    const metadata = JSON.stringify({
        schema: 1,
        filename,
        version: '3.0.1',
        integrity: 'original',
    })
    writeFileSync(join(directory, 'release.json'), metadata)
    writeFileSync(join(directory, filename), 'original')
    execFileSync('zip', ['-q', 'artifact.zip', 'release.json', filename], { cwd: directory })
    const archive = readFileSync(join(directory, 'artifact.zip'))
    const artifact = {
        id: 123,
        name: 'release-42-2',
        expired: false,
        digest: `sha256:${createHash('sha256').update(archive).digest('hex')}`,
        workflow_run: {
            id: 42,
            repository_id: 1069607965,
            head_repository_id: 1069607965,
            head_sha: sourceRun.head_sha,
            head_branch: 'main',
        },
    }
    const api = {
        list: (id: number) => {
            expect(id).toBe(42)
            return [artifact]
        },
        download: (id: number) => {
            expect(id).toBe(123)
            return archive
        },
    }
    return {
        directory,
        filename,
        metadata,
        artifact,
        api,
        cleanup: () => rmSync(directory, { recursive: true, force: true }),
    }
}

describe('authenticated original-attempt archive binding', () => {
    it.each(['matching', 'replaced tarball', 'replaced metadata'])(
        'checks %s against GitHub archive bytes',
        (scenario) => {
            const f = fixture()
            try {
                if (scenario === 'replaced tarball')
                    writeFileSync(join(f.directory, f.filename), 'forged')
                if (scenario === 'replaced metadata')
                    writeFileSync(
                        join(f.directory, 'release.json'),
                        f.metadata.replace('original', 'forged'),
                    )
                const verify = () => compareRetainedArtifact(f.directory, sourceRun, f.api)
                if (scenario === 'matching') expect(verify).not.toThrow()
                else expect(verify).toThrow(/differs from the authenticated build artifact/)
            } finally {
                f.cleanup()
            }
        },
    )
    it.each([
        'wrong attempt',
        'wrong SHA',
        'wrong repository',
        'missing digest',
        'changed archive',
        'expired',
    ])('rejects %s despite self-consistent local metadata', (reason) => {
        const f = fixture()
        try {
            if (reason === 'wrong attempt') f.artifact.name = 'release-42-3'
            if (reason === 'wrong SHA') f.artifact.workflow_run.head_sha = 'b'.repeat(40)
            if (reason === 'wrong repository') f.artifact.workflow_run.head_repository_id = 123
            if (reason === 'missing digest') f.artifact.digest = ''
            if (reason === 'changed archive') f.api.download = () => Buffer.from('replacement')
            if (reason === 'expired') f.artifact.expired = true
            expect(() => compareRetainedArtifact(f.directory, sourceRun, f.api)).toThrow()
        } finally {
            f.cleanup()
        }
    })
})
