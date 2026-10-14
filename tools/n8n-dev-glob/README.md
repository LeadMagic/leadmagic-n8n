# n8n development glob adapter

The pinned official `@n8n/node-cli` uses `fast-glob` only to discover build assets and render template files. Its dependency chain includes `braces` 3.0.3, which has an unpatched high-severity advisory: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

This development-only adapter delegates the used callable/async and `.sync` APIs to pinned [tinyglobby](https://github.com/SuperchupuDev/tinyglobby) 0.2.17. It supports the CLI's `cwd`, `absolute`, `dot`, and `ignore` options and rejects additional options. It preserves file-only discovery without adopting tinyglobby's directory-expansion default. Tests exercise both official CLI consumers against filesystem fixtures.

The pnpm override targets only `@n8n/node-cli>fast-glob`. Keep the required full-tree audit gate enabled. This adapter and its dependency are development tooling and must stay outside the published n8n package. Recheck the used API before upgrading the CLI; remove the adapter when a compatible upstream release eliminates the vulnerable dependency.
