# Changelog

## 1.6.0

- Add Raw, Simplified, and Selected Fields output controls while preserving raw responses by default.
- Stop further requests when an execution is cancelled; reject empty bulk lists before sending requests.
- Use sanitized NodeApiError instances with HTTP status and item context; keep validation failures as NodeOperationError.
- Apply timeout and redirect protection to credential tests.
- Add regression coverage for item links, array responses, partial failures, cancellation, sensitive errors, and output selection.


## 1.5.0

- Replace the old PNG with LeadMagic's current official SVG in the node and credentials.
- Use the official n8n node CLI and strict lint rules; simplify and sort menus while preserving saved operation IDs.
- Add modern connection types, AI-tool availability, and typed request bodies.
- Package documentation metadata and verify npm entrypoints, assets, and allowed files.
- Publish through GitHub Actions with npm trusted publishing and provenance; document npm and n8n verification separately.


## Public-content privacy review — 2026-09-06

Use synthetic contact examples, remove unnecessary identity and credential-like samples, and clarify publication, attribution, and claims requirements.


## Unreleased — 2026-09-06

Correct public routes and GET credential checks; align ad URLs and employee limits; add timeouts, redirect protection, mocked operation tests, and refreshed dependencies. Test saved workflows before upgrading.

