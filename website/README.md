# Twist SDK documentation

The site is built with Docusaurus and TypeDoc from the SDK source.

```sh
npm ci --ignore-scripts
npm run build
npm --prefix website ci --ignore-scripts
npm --prefix website run build
```

Run these from the repository root. The build produces static files in `website/build`; it does not publish them. During coordinated migration work, reserve the local heavy-build slot before the full website build. Hosted PR validation is independent.

`.github/workflows/validate-docs.yml` builds pull-request documentation without deployment. `.github/workflows/deploy-docusaurus.yml` publishes on `main` pushes or authorized manual dispatch through the existing `github-pages` environment. Merging this migration therefore redeploys documentation; keep that merge under the cutover operator's control.

The intended site is <https://todoist.github.io/twist-sdk-typescript/> with base path `/twist-sdk-typescript/`. After rename, inspect [Pages settings](https://github.com/todoist/twist-sdk-typescript/settings/pages) (GitHub Actions, public, no custom domain) and existing environment branch restrictions. Verify the landing page, `/authorization/`, `/api/classes/TwistApi/`, images and canonical URLs. Local build success does not prove the destination is deployed. Do not rely on the old Pages hostname redirecting.
