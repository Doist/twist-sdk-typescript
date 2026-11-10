import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { REPOSITORY, SHA, VERSION, validatePublicationTag } from './release-policy.mjs'

const paths = ['CHANGELOG.md', 'package.json', 'package-lock.json']
const prefix = '[Posted by Jarvis]\n\n'

export function sourceRecordApi() {
    const request = (path, body, method = 'POST') =>
        JSON.parse(
            execFileSync(
                'gh',
                [
                    'api',
                    `repos/${REPOSITORY}/${path}`,
                    ...(body ? ['--method', method, '--input', '-'] : []),
                ],
                {
                    encoding: 'utf8',
                    maxBuffer: 4 * 1024 * 1024,
                    ...(body ? { input: JSON.stringify(body) } : {}),
                },
            ),
        )
    return {
        head: () => request('git/ref/heads/main').object.sha,
        compare: (base, head) => request(`compare/${base}...${head}`),
        read: (path, sha) => {
            const file = request(`contents/${path}?ref=${sha}`)
            assert.equal(file.type, 'file')
            assert.equal(
                file.encoding,
                'base64',
                'Source file unavailable; stop without overwriting it',
            )
            return Buffer.from(file.content, 'base64').toString('utf8')
        },
        commit: (parent, files, message) => {
            const base = request(`git/commits/${parent}`)
            const tree = request('git/trees', {
                base_tree: base.tree.sha,
                tree: Object.entries(files).map(([path, content]) => ({
                    path,
                    mode: '100644',
                    type: 'blob',
                    content,
                })),
            })
            return request('git/commits', { message, tree: tree.sha, parents: [parent] }).sha
        },
        advance: (sha) => request('git/refs/heads/main', { sha, force: false }, 'PATCH'),
    }
}

function marker(metadata) {
    assert.match(metadata.sourceSha, SHA)
    assert.match(metadata.sha256, /^[a-f0-9]{64}$/)
    return `<!-- twist-sdk-release:${metadata.version} source:${metadata.sourceSha} artifact:${metadata.sha256} -->`
}

function inspect(files) {
    const manifest = JSON.parse(files['package.json'])
    const lock = JSON.parse(files['package-lock.json'])
    assert.equal(manifest.name, '@todoist/twist-sdk')
    assert.equal(lock.name, manifest.name)
    assert.equal(lock.packages[''].name, manifest.name)
    assert.equal(
        lock.version,
        manifest.version,
        'Current package/lock versions differ; preserve user changes',
    )
    assert.equal(lock.packages[''].version, manifest.version)
    return { manifest, lock }
}

function hasRecord(files, metadata) {
    const expected = marker(metadata)
    const records = files['CHANGELOG.md']
        .split('\n')
        .filter((line) => line.startsWith(`<!-- twist-sdk-release:${metadata.version} `))
    if (!records.length) return false
    assert.deepEqual(records, [expected], 'Conflicting source record; never overwrite history')
    const { manifest } = inspect(files)
    validatePublicationTag(manifest.version, 'latest', { latest: metadata.version })
    return true
}

function currentSource(api, metadata) {
    assert.match(metadata.sourceSha, SHA)
    const head = api.head()
    assert.match(head, SHA)
    const ancestry = api.compare(metadata.sourceSha, head)
    assert.ok(
        ['ahead', 'identical'].includes(ancestry.status),
        'Original build is outside current main history',
    )
    assert.equal(ancestry.merge_base_commit.sha, metadata.sourceSha)
    return { head, files: Object.fromEntries(paths.map((path) => [path, api.read(path, head)])) }
}

// A published stable tag alone is not a completed source-record baseline.
export function assertStableSourceRecorded(api, metadata) {
    if (metadata.branch !== 'main') return
    const { files } = currentSource(api, metadata)
    assert.ok(
        hasRecord(files, metadata),
        'Stable source record is incomplete; retry the original artifact recorder before packing again',
    )
}

export function recordStableSource(api, metadata) {
    if (metadata.branch !== 'main') return { status: 'prerelease-skipped' }
    assert.match(metadata.version, VERSION)
    assert.ok(!metadata.version.includes('-'), 'Only stable releases update main source records')
    assert.ok(metadata.notes.startsWith(prefix))
    const { head, files } = currentSource(api, metadata)
    if (hasRecord(files, metadata)) return { status: 'already-recorded' }
    const { manifest, lock } = inspect(files)
    const source = JSON.parse(api.read('package.json', metadata.sourceSha))
    assert.ok(
        [source.version, metadata.version].includes(manifest.version),
        'Main version changed since the build; reconcile source records without downgrading or repacking',
    )
    // Change only version fields in current main, retaining intervening dependency/config edits.
    manifest.version = lock.version = lock.packages[''].version = metadata.version
    const format = (value, original) =>
        JSON.stringify(value, null, original.match(/\n([\t ]+)"/)?.[1] || '    ') + '\n'
    const updated = {
        'CHANGELOG.md': `${metadata.notes.slice(prefix.length).trim()}\n\n${marker(metadata)}\n\n${files['CHANGELOG.md']}`,
        'package.json': format(manifest, files['package.json']),
        'package-lock.json': format(lock, files['package-lock.json']),
    }
    const sha = api.commit(
        head,
        updated,
        `chore(release): ${metadata.version} [skip ci]\n\nOriginal build: ${metadata.sourceSha}\nOriginal artifact SHA256: ${metadata.sha256}`,
    )
    assert.match(sha, SHA)
    // Non-fast-forward/protection failures stop safely. Retry reads fresh main, never forces it.
    api.advance(sha)
    assertStableSourceRecorded(api, metadata)
    return { status: 'recorded', sha, buildSha: metadata.sourceSha }
}

// All external boundaries are injectable for ordering/interruption tests. The actual CLI uses
// the original artifact verifier and both registry check commands, never metadata assertions alone.
export function finishReleaseRecords(metadata, operations) {
    operations.verifyArtifact()
    const channel = metadata.branch === 'next' ? 'next' : 'latest'
    for (const destination of ['npmjs', 'github']) {
        const state = operations.checkRegistry(destination)
        assert.equal(
            state.tags[channel],
            metadata.version,
            'Record only after both normal channels match; recovery stays separate',
        )
    }
    const created = operations.completeRelease()
    operations.recordChannel()
    const source =
        metadata.branch === 'main' ? operations.recordSource() : { status: 'prerelease-skipped' }
    return { created, source }
}
