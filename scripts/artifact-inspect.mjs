import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { VERSION } from './release-policy.mjs'

const hash = (bytes, algorithm, encoding) => createHash(algorithm).update(bytes).digest(encoding)
const run = (bin, args) => execFileSync(bin, args, { encoding: 'utf8' }).trim()

export function inspect(tarball) {
    const files = run('tar', ['-tzf', tarball]).split('\n').sort()
    assert.ok(files.includes('package/dist/esm/index.js'))
    assert.ok(files.includes('package/dist/cjs/index.js'))
    assert.equal(
        JSON.parse(run('tar', ['-xOzf', tarball, 'package/dist/cjs/package.json'])).type,
        'commonjs',
    )
    assert.ok(files.includes('package/dist/types/index.d.ts'))
    for (const file of files) {
        assert.ok(
            /^package\/(?:package.json|README.md|LICENSE|dist\/(?:cjs|esm|types)\/[^\n]+)$/.test(
                file,
            ),
            `Unexpected packed file: ${file}`,
        )
        assert.ok(
            !file.split('/').includes('..') && !file.includes('.test.'),
            `Unsafe packed file: ${file}`,
        )
    }
    const manifest = JSON.parse(run('tar', ['-xOzf', tarball, 'package/package.json']))
    assert.equal(manifest.name, '@todoist/twist-sdk')
    assert.match(manifest.version, VERSION)
    assert.equal(manifest.private, undefined)
    // Routing, visibility and provenance belong to each destination, never the shared tarball.
    assert.equal(manifest.publishConfig, undefined)
    assert.equal(manifest.scripts, undefined)
    assert.equal(manifest.repository, 'https://github.com/todoist/twist-sdk-typescript')
    assert.ok(!Object.keys(manifest.dependencies).some((name) => name.startsWith('@doist/')))
    assert.equal(manifest.exports['.'].import, './dist/esm/index.js')
    assert.equal(manifest.exports['.'].require, './dist/cjs/index.js')
    assert.equal(manifest.exports['.'].types, './dist/types/index.d.ts')
    const bytes = readFileSync(tarball)
    return {
        name: manifest.name,
        version: manifest.version,
        sha256: hash(bytes, 'sha256', 'hex'),
        integrity: `sha512-${hash(bytes, 'sha512', 'base64')}`,
    }
}
