import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inspect } from './artifact-inspect.mjs'

function fixture(change: Record<string, unknown> = {}, extraFile = '') {
    const directory = mkdtempSync(resolve(tmpdir(), 'twist-inspect-fixture-'))
    try {
        const manifest = {
            name: '@todoist/twist-sdk',
            version: '3.0.1',
            repository: 'https://github.com/todoist/twist-sdk-typescript',
            dependencies: {},
            exports: {
                '.': {
                    import: './dist/esm/index.js',
                    require: './dist/cjs/index.js',
                    types: './dist/types/index.d.ts',
                },
            },
            ...change,
        }
        const files: Record<string, string> = {
            'package/package.json': JSON.stringify(manifest),
            'package/dist/esm/index.js': 'export {}',
            'package/dist/cjs/index.js': 'module.exports = {}',
            'package/dist/cjs/package.json': '{"type":"commonjs"}',
            'package/dist/types/index.d.ts': 'export {}',
        }
        if (extraFile) files[extraFile] = 'fixture'
        for (const [path, content] of Object.entries(files)) {
            mkdirSync(dirname(resolve(directory, path)), { recursive: true })
            writeFileSync(resolve(directory, path), content)
        }
        const tarball = resolve(directory, 'fixture.tgz')
        execFileSync('tar', ['-czf', tarball, '-C', directory, ...Object.keys(files)])
        return { actual: inspect(tarball), bytes: readFileSync(tarball) }
    } finally {
        rmSync(directory, { recursive: true, force: true })
    }
}

describe('actual retained tarball inspection', () => {
    it('checks real archive entries and hashes original bytes', () => {
        const { actual, bytes } = fixture()
        expect(actual).toEqual({
            name: '@todoist/twist-sdk',
            version: '3.0.1',
            sha256: createHash('sha256').update(bytes).digest('hex'),
            integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
        })
    })
    it.each(['package/.npmrc', 'package/dist/esm/index.test.js'])(
        'rejects forbidden file %s',
        (file) => expect(() => fixture({}, file)).toThrow(/packed file/),
    )
    it.each([
        { name: '@doist/twist-sdk' },
        { dependencies: { '@doist/example': '1.0.0' } },
        { publishConfig: { registry: 'https://npm.pkg.github.com/' } },
        { scripts: { prepare: 'unreviewed' } },
        { exports: { '.': { import: './wrong.js' } } },
    ])('rejects incompatible or destination-specific manifest %j', (change) => {
        expect(() => fixture(change)).toThrow()
    })
})
