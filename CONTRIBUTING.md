# Contributing to Twist SDK

The following is a set of guidelines for contributing to the Twist SDK. Please read these guidelines before creating an issue or pull request.

## Open Development

All work on Twist SDK happens directly on [GitHub](https://github.com/todoist/twist-sdk-typescript). Both core team members and external contributors send pull requests that go through the same review process.

## Semantic Versioning

Twist SDK follows [semantic versioning](https://semver.org/). We release patch versions for bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes.

Release notes are retained with each GitHub release. Stable releases also update [CHANGELOG.md](CHANGELOG.md) and the source package/lock versions after both registries have accepted the original artifact; prereleases leave those source records unchanged.

## Branch Organization

Submit all changes to the [main](https://github.com/todoist/twist-sdk-typescript/tree/main) branch (via PR) by default. For pre-release work, target the `next` branch instead — see [Release Process](#release-process-core-team-only) for details.

We do our best to keep `main` in good shape, with all tests passing.

## Development Workflow

After cloning the repository and installing dependencies with `npm install`, several commands are at your disposal:

- `npm run build`: Builds the package for publishing to npm
- `npm run check`: Validates code quality and formatting
- `npm run check:fix`: Auto-fixes lint and formatting issues
- `npm test`: Runs all tests
- `npm run test:watch`: Runs tests in watch mode
- `npm run integrity-checks`: Runs the full CI validation pipeline

## Sending a Pull Request

Before submitting a pull request, please take the following into consideration:

- Create your branch from `main` (or from `next` if working on a pre-release feature)
- Follow the [Commit Message Guidelines](#commit-message-guidelines) below
- Add tests for code that should be tested
- Ensure the test suite passes
- Do not override built-in validation and formatting checks

## Commit Message Guidelines

### Commit Message Format

This repository expects all commit messages to follow the [Conventional Commits Specification](https://www.conventionalcommits.org/) to automate semantic versioning and changelog generation.

Each commit message consists of a **header**, an **optional body**, and an **optional footer**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Commit types such as `feat:` and `fix:` affect versioning and changelog generation. Other types like `build:`, `chore:`, `ci:`, `docs:`, `perf:`, `refactor:`, `style:` and `test:` are valid but will not trigger a release.

A commit that has the text `BREAKING CHANGE:` at the beginning of its optional body or footer, or appends a `!` after the type/scope, introduces a breaking API change (correlating with `MAJOR` in semantic versioning).

### Semantic Pull Request Validation

PR titles are validated against the Conventional Commits format by CI. When squash-merging, the PR title becomes the commit message, so ensure it follows the format (e.g., `feat: add new endpoint`, `fix: correct pagination`).

## Release Process (core team only)

Release analysis uses [semantic-release](https://github.com/semantic-release/semantic-release) and existing `v<version>` tags. A push to `main` or `next` validates, builds and retains an artifact. Publication is a separate controlled workflow; it writes that same artifact to both registries before recording the release. Automatic publication is disabled during the first new-scope bootstrap.

The first current-forward `@todoist/twist-sdk` release is 3.0.1. After that baseline is published, conventional commits determine normal future versions. Keep `next` synchronized with `main` through the normal reviewed process before prerelease work; merge prerelease history into `main` without squashing to preserve commit analysis. `next` releases use the `next` npm tag. Do not rebuild old releases or change historical tags.

See [docs/releasing.md](docs/releasing.md) for exact workflow/trust settings, operator commands, retained-artifact retries and interrupted draft recovery.

```sh
npm install @todoist/twist-sdk@next
```

## License

By contributing to Twist SDK, you agree that your contributions will be licensed under its [MIT license](LICENSE).
