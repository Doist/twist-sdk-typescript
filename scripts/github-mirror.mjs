import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { REPOSITORY } from './release-policy.mjs'

// A registry 404 may also hide a package the token cannot read. This public mirror already
// exists under the old owner; require its transferred public identity before a registry write.
export function assertGithubMirror(
    environment = process.env,
    io = { execFileSync, spawnSync },
    cwd,
) {
    assert.ok(environment.GH_PACKAGES_TOKEN, 'Read access to the GitHub mirror is required')
    const env = { ...environment, GH_TOKEN: environment.GH_PACKAGES_TOKEN }
    const read = (path) =>
        JSON.parse(io.execFileSync('gh', ['api', path], { env, encoding: 'utf8' }))
    const mirror = read('orgs/todoist/packages/npm/twist-sdk')
    assert.equal(
        mirror.visibility,
        'public',
        'The existing GitHub mirror must remain public; an administrator must inspect transfer/visibility before any write',
    )
    assert.equal(mirror.repository?.full_name.toLowerCase(), REPOSITORY)
    assert.equal(mirror.repository?.id, 1069607965, 'Unexpected repository identity')
    // Check registry authentication independently of REST visibility, including a first-version lookup.
    const auth = io.spawnSync('npm', ['whoami', '--registry=https://npm.pkg.github.com/'], {
        env: environment,
        cwd,
        encoding: 'utf8',
    })
    assert.equal(
        auth.status,
        0,
        'GitHub registry read authentication failed; do not interpret 404 as absence',
    )
    assert.ok(auth.stdout.trim(), 'Empty GitHub registry identity')
}
