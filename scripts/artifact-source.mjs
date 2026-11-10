import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { REPOSITORY, VERSION, validateSchema } from './release-policy.mjs'

export function artifactApi() {
    return {
        list(runId) {
            const lines = execFileSync(
                'gh',
                [
                    'api',
                    '--paginate',
                    `repos/${REPOSITORY}/actions/runs/${runId}/artifacts?per_page=100`,
                    '--jq',
                    '.artifacts[] | {id, name, expired, digest, workflow_run}',
                ],
                { encoding: 'utf8' },
            ).trim()
            return lines ? lines.split('\n').map((line) => JSON.parse(line)) : []
        },
        download(id) {
            return execFileSync('gh', ['api', `repos/${REPOSITORY}/actions/artifacts/${id}/zip`], {
                maxBuffer: 64 * 1024 * 1024,
            })
        },
    }
}

export function compareRetainedArtifact(directory, sourceRun, api = artifactApi()) {
    const name = `release-${sourceRun.id}-${sourceRun.run_attempt}`
    const matches = api.list(sourceRun.id).filter((artifact) => artifact.name === name)
    assert.equal(
        matches.length,
        1,
        'Expected unique original-attempt artifact; recover original bytes, never repack',
    )
    const artifact = matches[0]
    assert.equal(
        artifact.expired,
        false,
        'Original artifact expired; retain original bytes and use reviewed manual recovery, never repack',
    )
    assert.equal(artifact.workflow_run.id, sourceRun.id)
    assert.equal(artifact.workflow_run.repository_id, 1069607965)
    assert.equal(artifact.workflow_run.head_repository_id, 1069607965)
    assert.equal(artifact.workflow_run.head_sha, sourceRun.head_sha)
    assert.equal(artifact.workflow_run.head_branch, sourceRun.head_branch)
    assert.match(
        artifact.digest || '',
        /^sha256:[a-f0-9]{64}$/,
        'Missing authenticated archive digest; original-byte recovery requires maintainer review',
    )
    const archive = api.download(artifact.id)
    assert.equal(
        `sha256:${createHash('sha256').update(archive).digest('hex')}`,
        artifact.digest,
        'Downloaded archive differs from GitHub API digest',
    )
    const retained = mkdtempSync(resolve(tmpdir(), 'twist-sdk-retained-'))
    try {
        const zip = resolve(retained, 'artifact.zip')
        writeFileSync(zip, archive)
        // Read entries to memory, never extract arbitrary archive paths into the checkout.
        const entries = execFileSync('unzip', ['-Z', '-1', zip], { encoding: 'utf8' })
            .trim()
            .split('\n')
        const read = (entry) =>
            execFileSync('unzip', ['-p', zip, entry], { maxBuffer: 64 * 1024 * 1024 })
        assert.equal(entries.filter((entry) => entry === 'release.json').length, 1)
        const manifest = read('release.json')
        assert.deepEqual(
            readFileSync(resolve(directory, 'release.json')),
            manifest,
            'Local release metadata differs from the authenticated build artifact',
        )
        const metadata = JSON.parse(manifest)
        validateSchema(metadata)
        assert.match(metadata.version, VERSION)
        assert.equal(metadata.filename, `todoist-twist-sdk-${metadata.version}.tgz`)
        assert.deepEqual(
            entries.sort(),
            ['release.json', metadata.filename].sort(),
            'Unexpected archive entries',
        )
        assert.deepEqual(
            readFileSync(resolve(directory, metadata.filename)),
            read(metadata.filename),
            'Local tarball differs from the authenticated build artifact',
        )
    } finally {
        rmSync(retained, { recursive: true, force: true })
    }
}
