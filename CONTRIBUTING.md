# Contributing

Use Node.js 22 or newer and pnpm 10.33.0. Fork and clone the repository, then run:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm lint
pnpm test
pnpm check:package
pnpm dev
```

`pnpm dev` uses the official n8n node development CLI. Use a separate development instance and fictional examples. Keep node type, credential name, and operation IDs stable for saved workflows. Follow the strict, unmodified n8n ESLint configuration and format TypeScript with `pnpm format`.

Keep runtime code dependency-free and use n8n credential and HTTP helpers. Do not read the filesystem or environment from node execution. Add regression tests for route, payload, error, or item-linking changes. Mock network requests in automated tests; paid API calls require authorization.

See [PUBLICATION.md](PUBLICATION.md) for safe examples and attribution, [SECURITY.md](SECURITY.md) for private reporting, and [RELEASING.md](RELEASING.md) for publishing.
