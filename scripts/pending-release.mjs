import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import {
    githubReleaseApi,
    assertRecordedBaseline,
    assertPublishedRecord,
    findRelease,
    releaseFiles,
} from './github-release-record.mjs'
import { publishArtifact } from './registry-release.mjs'
import { REPOSITORY, VERSION } from './release-policy.mjs'
import { assertStableSourceRecorded, sourceRecordApi } from './source-release-record.mjs'

// Analysis and publication are separate jobs. Do not make two different tarballs for the same
// next version when another push arrives before the earlier artifact's publication is recorded.
export function requireRecordedPlans(plans, isRecorded) {
    for (const plan of plans) {
        assert.match(plan.version, VERSION)
        assert.ok(
            isRecorded(plan),
            `Retained release ${plan.version} from run ${plan.runId} is not recorded. Finish that exact artifact first, then dispatch a new build from the current release branch.`,
        )
    }
}

export function requireUnallocatedVersion(version, tagExists) {
    assert.match(version, VERSION)
    assert.ok(
        !tagExists(`v${version}`),
        `Version ${version} is already tagged; complete its release/channel record before building again`,
    )
}

export function successfulArtifactAttempt(run, artifact, readAttempt) {
    const match = artifact.name.match(new RegExp(`^release-${run.id}-([1-9]\\d*)$`))
    assert.ok(match, 'Artifact has no original attempt identity')
    const attempt = readAttempt(run.id, match[1])
    assert.equal(attempt.id, run.id)
    assert.equal(String(attempt.run_attempt), match[1])
    assert.equal(attempt.head_sha, run.head_sha)
    assert.equal(attempt.status, 'completed', 'Wait for the original artifact attempt to finish')
    return attempt.conclusion === 'success'
}

export async function checkPendingReleases(baselineTag, proposedVersion) {
    const releases = githubReleaseApi()
    const baseline = await assertRecordedBaseline(releases, baselineTag)
    if (baseline) {
        assertStableSourceRecorded(sourceRecordApi(), baseline)
        for (const destination of ['npmjs', 'github'])
            publishArtifact({ metadata: baseline, destination, command: 'check-registry' })
    }
    const api = (path) =>
        JSON.parse(execFileSync('gh', ['api', `repos/${REPOSITORY}/${path}`], { encoding: 'utf8' }))
    requireUnallocatedVersion(
        proposedVersion,
        (tag) =>
            spawnSync('git', ['rev-parse', '--verify', `refs/tags/${tag}`], { stdio: 'ignore' })
                .status === 0,
    )
    const branch = process.env.GITHUB_REF_NAME
    assert.ok(['main', 'next'].includes(branch))
    // Project each page before capturing it; full workflow-run payloads grow beyond Node's buffer.
    const runLines = execFileSync(
        'gh',
        [
            'api',
            '--paginate',
            `repos/${REPOSITORY}/actions/workflows/release.yml/runs?per_page=100`,
            '--jq',
            '.workflow_runs[] | {id, head_sha}',
        ],
        { encoding: 'utf8' },
    ).trim()
    const runs = runLines ? runLines.split('\n').map((line) => JSON.parse(line)) : []
    const directory = mkdtempSync(resolve(tmpdir(), 'twist-sdk-pending-'))
    try {
        for (const run of runs) {
            // The baseline's published record and original assets were verified above.
            // Earlier completed history needs no artifact download and may legitimately expire.
            if (
                spawnSync('git', ['merge-base', '--is-ancestor', run.head_sha, baselineTag], {
                    stdio: 'ignore',
                }).status === 0
            )
                continue
            const artifacts = api(`actions/runs/${run.id}/artifacts?per_page=100`).artifacts.filter(
                (item) => new RegExp(`^release-${run.id}-[1-9]\\d*$`).test(item.name),
            )
            for (const artifact of artifacts) {
                // A retained upload from a cancelled/failed attempt can never be published.
                // Consult the original attempt, not the latest rerun's conclusion.
                if (
                    !successfulArtifactAttempt(run, artifact, (id, attempt) =>
                        api(`actions/runs/${id}/attempts/${attempt}`),
                    )
                )
                    continue
                assert.ok(
                    !artifact.expired,
                    `Run ${run.id} artifact expired; recover the original bytes and record before another build`,
                )
                const target = resolve(directory, artifact.name)
                execFileSync(
                    'gh',
                    [
                        'run',
                        'download',
                        String(run.id),
                        '--repo',
                        REPOSITORY,
                        '--name',
                        artifact.name,
                        '--dir',
                        target,
                    ],
                    { stdio: 'pipe' },
                )
                const plan = JSON.parse(readFileSync(resolve(target, 'release.json'), 'utf8'))
                requireRecordedPlans([plan], (metadata) => {
                    assertPublishedRecord(
                        releases,
                        findRelease(releases, `v${metadata.version}`),
                        metadata,
                        releaseFiles(target, metadata),
                    )
                    return true
                })
            }
        }
    } finally {
        rmSync(directory, { recursive: true, force: true })
    }
}
