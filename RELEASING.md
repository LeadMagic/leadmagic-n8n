# Publishing and n8n availability

The npm package is `n8n-nodes-leadmagic`, owned by `jesseoue`. Keep this existing package name so installations can upgrade. The source repository is `LeadMagic/leadmagic-n8n`.

## One-time npm setup

An npm package owner must sign in and configure a GitHub Actions trusted publisher in the package Settings/Access page:

| Field | Value |
| --- | --- |
| GitHub organization | `LeadMagic` |
| Repository | `leadmagic-n8n` |
| Workflow filename | `publish.yml` |
| Environment | `npm-release` |
| Allowed action | Direct `npm publish` |

The workflow supports short-lived OIDC authentication. If the npm trusted publisher is not configured yet, a maintainer may temporarily supply a narrowly scoped `NPM_TOKEN` GitHub Actions secret; remove it after use. Do not add a token to source, workflow JSON, or logs. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Validate and publish

1. Update the package version and changelog; install with the committed pnpm lockfile.
2. Run `pnpm lint`, `pnpm test`, `pnpm check:package`, the dependency audit, and the public-file check. Test an installed package in a development n8n instance before release. Use synthetic inputs and obtain authorization before any paid API call.
3. Merge after CI passes. The `npm-release` environment requires approval from `@jesseoue` before a release or dry run starts. Run the **Publish to npm** workflow on `main` with `dry_run=true` to inspect packaging.
4. Publish a GitHub release with a tag matching the package version (for example, `v1.5.0`), or manually run the workflow on `main` with `dry_run=false`. Both publish using provenance and must reference a commit already in `main`. Do not reuse an npm version that already exists.
5. Verify the npm version, integrity, provenance, logo assets, and node/credential entrypoints. Install the published version in a development n8n instance and test saved workflow compatibility.

## n8n verification

Read the [current n8n verification guidelines](https://docs.n8n.io/connect/create-nodes/build-your-node/reference/verification-guidelines) and [submission instructions](https://docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes). Submit the published package through the Creator Portal linked by n8n. Submission/review is separate from npm publication; never claim verification until n8n approves it.

Provide the npm package, GitHub repository, README/authentication instructions, supported operation list, sanitized example workflows, and test evidence. Supply any requested test credentials privately through n8n's authorized process, never in this repository. The package retains its original operation IDs, uses n8n credentials and HTTP helpers, and has no runtime dependencies, filesystem access, or environment-variable access.

The official SVG has an opaque purple background that renders on light and dark canvases. Strict lint currently emits two advisory single-icon warnings; it has no disabled rules.

When refreshing branding, copy the official icon into both `nodes/LeadMagic/leadmagic.svg` and `credentials/leadmagic.svg`. Keep the artwork and square viewBox intact. Preview it at 16, 24, 32, and 48 pixels on both light and dark backgrounds. `pnpm check:package` verifies that both source copies and both packaged copies match, and rejects SVG assets with external references or active content.
