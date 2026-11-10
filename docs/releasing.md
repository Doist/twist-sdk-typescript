# Release the retained Twist SDK artifact

This is the operator procedure for **future authorized releases**. Preparing a PR does not authorize publication, workflow dispatch, tags, releases, settings changes or deployment.

## Source and version policy

`@todoist/twist-sdk` is public on npm and has a public GitHub Packages mirror linked to `todoist/twist-sdk-typescript` (repository ID `1069607965`). Both destinations must contain the **same tarball**, not two builds. The inspected old mirror stops at 2.2.0; do not backfill old releases.

The first current-forward release is **3.0.1**, from the reviewed migration on `main`, after `v3.0.0` (`27b8efc5169740f9ba77b2cd4c2fefb0648a5048`). `release.config.js` retains scope-independent `v${version}` history and uses semantic-release **analysis only**. The first patch is explicit; feature/breaking changes stop for target reconciliation. Later releases use conventional commits and the completed release/tag/channel-note baseline. `next` continues prereleases only after the first stable release. No old tags or branches are changed.

The source manifest records the last completed stable release; the pack plan sets the next calculated version in an isolated package directory. After both original-artifact copies, the published release record and channel notes are verified, stable publication commits generated `CHANGELOG.md`, `package.json` and `package-lock.json` updates back to current `main`. Prereleases skip these source updates. The separate generated commit identifies the original build SHA and artifact SHA-256; `v<version>` stays at the original build SHA and the retained tarball is never changed or repacked. Current user edits and historical changelog content are preserved. `npm publish` from the source checkout is intentionally blocked.

## Workflow and trust setup

- `.github/workflows/release.yml` — **Release artifact**: push to `main`/`next` or an authorized dispatch on either branch, checks out the exact event SHA, validates/tests/builds, analyzes and packs once. GitHub-hosted `ubuntu-latest`, Node 24 via `.nvmrc`, npm 11 or newer. No environment, npm trust, registry publication, release creation or messages. `contents: write` is needed for semantic-release's dry-run push authorization check; `actions: read` and `packages: read` verify history. It does not push.
- `.github/workflows/publish-release.yml` — **Publish retained release**: explicit dispatch from `main`, or a successful push-build completion only when repository variable `TWIST_SDK_AUTOMATIC_RELEASES=true`. Keep that variable unset for the first release. GitHub-hosted `ubuntu-latest`, environment **`npm-release`**, `actions: read`, `contents: read`, `packages: write`, `id-token: write`. No reusable caller or M01 action dependency. Only after both copies and normal channel tags match, the existing release App (`DOIST_RELEASE_BOT_ID`, `DOIST_RELEASE_BOT_PRIVATE_KEY`, contents-write permission) records a tag, attributed release and semantic-release channel note, then the stable source commitback. No issue/PR comments or team announcements.
- Configure `npm-release` required reviewers and restrict deployments to `main`; retain protection for `github-pages` separately. Serialize publication across both channels. Pack jobs also share one concurrency group; finish a pending artifact before packing the next release.
- After the first real npm publication, configure npm trusted publishing for owner **`todoist`**, repository **`twist-sdk-typescript`**, workflow **`publish-release.yml`**, environment **`npm-release`**. Enable direct npm publish. Configure near the next real release; a new connection expires after two days without a successful publish. A manual bootstrap does not validate OIDC. The publisher disables provenance because its commit can differ from the build commit. No dist-tag mutation is automated.
- Inspect [repository Actions](https://github.com/todoist/twist-sdk-typescript/settings/actions), [environments](https://github.com/todoist/twist-sdk-typescript/settings/environments), [App installation](https://github.com/organizations/todoist/settings/installations), [npm package settings](https://www.npmjs.com/package/@todoist/twist-sdk/access) and [GitHub package settings](https://github.com/orgs/todoist/packages/npm/twist-sdk/settings). Preserve the independently confirmed **public** mirror, repository linkage and inheritance. Give this publisher write access and actual GitHub-routed consumer repositories read access; organization membership is not proof of access.

See [npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/), [trusted publishing](https://docs.npmjs.com/trusted-publishers/) and [GitHub npm authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry). Use a classic PAT with `read:packages` for local GitHub reads; Actions uses its repository token with package access. Never pass GitHub credentials to npmjs.

## First real publication

After rename, verify repository and package transfer, public mirror visibility and access. A missing/inaccessible GitHub package identity blocks this helper before **any** registry write; have the package administrator reconcile transfer/access using the existing public mirror. Do not create a placeholder or backfill a legacy version.

1. Merge the reviewed producer PR when its merge effects are authorized. The `main` push runs checks, **pack only**, and the existing **Pages deployment**. The publish workflow remains gated with automatic releases disabled. No required new-scope dependencies block this SDK.
2. Obtain the successful **Release artifact** run ID, attempt and full SHA. The artifact is named `release-RUN_ID-ATTEMPT` and contains `todoist-twist-sdk-3.0.1.tgz` plus `release.json` (schema 1, SHA-256, SHA-512 integrity, source SHA, branch, version, attributed notes and run/attempt). Retention is 90 days; archive those exact bytes durably before expiry. Never rerun a successful pack merely to retry publication.
3. In a clean reviewed checkout, download and verify the original artifact. Set the following values from that actual run; the commands below are operator-only, not a rehearsal:

    ```sh
    export ARTIFACT_RUN_ID=ACTUAL_SUCCESSFUL_RUN_ID
    export ARTIFACT_RUN_ATTEMPT=ACTUAL_SUCCESSFUL_ATTEMPT
    export RELEASE_SHA=ACTUAL_FULL_BUILD_SHA
    export RELEASE_TAG=latest
    gh run download "$ARTIFACT_RUN_ID" --repo todoist/twist-sdk-typescript \
      --name "release-$ARTIFACT_RUN_ID-$ARTIFACT_RUN_ATTEMPT" --dir release-artifact
    node scripts/release.mjs verify release-artifact
    ```

4. Supply `GH_PACKAGES_TOKEN` through the maintainer's normal secret flow (local read:packages; never paste it into a command or report). Run the first npm publish from a real terminal:

    ```sh
    node scripts/release.mjs bootstrap-npm release-artifact
    ```

    The helper creates temporary isolated npm configs, checks routing and both exact-version copies, performs interactive `npm login`, rechecks both copies, and publishes the retained tarball with public access, scripts and provenance disabled. **Both login and publish inherit terminal IO for fresh 2FA.** The GitHub read token is stripped from npmjs's process environment. Configs are removed; global settings are untouched. Packed routing/access/provenance/lifecycle fields are absent.

5. From `main`, dispatch **Publish retained release** with `artifact_run_id`, `artifact_run_attempt`, `source_sha`, destination **github**, tag **normal**. It downloads the same original artifact, compares both copies before writing the missing mirror, and verifies both normal tags. The release App then completes the normal release record without rebuilding or recalculating a version. Confirm `v3.0.1` targets the original build SHA, is published/stable, and contains both original assets; confirm semantic-release channel notes and the separate generated stable source commit (`source_record_sha` output). Verify npmjs installation and authenticated GitHub installation with actual consumer credentials. Public-only consumers can use npmjs; mixed public/private `@todoist` consumers must route that scope to GitHub, which has no automatic npm fallback.

## Retry and interruption recovery

Use **Publish retained release** from `main` with the original run, attempt and source SHA, selecting `npmjs`, `github` or `both`. Every registry write, including one-mirror retries, compares both required exact-version copies with the original retained artifact. A mismatch or authentication/network ambiguity stops before writing. Existing matching copies are skipped.

The source checks bind the original successful run to the repository, workflow ID/path, push/dispatch event, exact checkout SHA and reviewed `main`/`next` ancestry. Local metadata and bytes must match the original attempt’s Actions ZIP, whose SHA-256 must match the authenticated GitHub artifact API digest; artifact repository/run/SHA/branch and exact archive entries are also checked. The ZIP is read without extracting paths into the checkout. An authenticated `whoami` or ACL-filtered package listing cannot prove absence: the preflight requires exact public REST linkage plus a readable, well-formed npm registry package document and dist-tags using the same GitHub token before accepting a version404. Registry root404, malformed metadata or missing latest fails closed before either registry write, including bootstrap; there is no known-mirror absence override. A later reviewed change to the workflow does not invalidate the original artifact: there is no current/historical workflow byte-equality condition. Unsupported schema, deleted source history or expired artifact stops with original-byte/manual recovery; **never rebuild an immutable already-published version**. The original attempt remains selectable even if a later rerun fails.

If `latest` or `next` has advanced, a missing older mirror must use **migration-recovery**. This does not move either normal channel or create/promote a release. The package maintainer owns later explicit promotion/cleanup of that temporary tag after verifying both copies and the intended channel. The helper does not quietly promote an already existing version; normal release recording stops if either normal tag is wrong. Use authorized interactive npm tag management or a separately configured trusted connection with dist-tag permission and supported npm CLI (v11 >=11.21 or v12 >=12.2), then rerun the same artifact path. Do not solve a missing mirror with a new version bump.

Release recording is resumable: a matching interrupted draft with missing assets receives only the missing original assets, then publishes. A matching fully published record must still have the correct tag commit, state and exact assets. Wrong commits, mismatched/incomplete assets, duplicate records or published records missing assets stop with precise same-record recovery instructions. Never delete/recreate releases or force-move tags. A draft never establishes the next semantic baseline. New-scope baselines also require matching registry copies; the pinned legacy 3.0.0 baseline is exempt from repairing the old mirror.

If release publication completed but the channel-note push failed, rerun the original publisher. It validates the completed record and finishes the note idempotently. A proposed version already tagged cannot be packed again.

Stable source-record retries use an artifact-bound marker in the changelog, so a lost commitback response cannot duplicate the entry. Updates are based on fresh `main` and advance it without force; intervening user version decisions, conflicting markers, branch-protection or concurrent-main changes stop for reconciliation. Only the three generated record files are updated, retaining other fields and historical notes. Verify that the existing release App can perform its normal protected-main release commit; do not weaken repository rules. A stable published baseline with unfinished source records blocks the next pack until the original recorder completes. No main commitback happens for `next` or migration-recovery.
