# Agent instructions — genealogy engine

This repository is the **public, reusable application engine**. Its canonical sibling is `Antiokh/genealogy-antiokh`, the genealogy site's content and deployment repository. These repositories have different responsibilities; do not treat the site repository as the upstream source of engine code.

## Where to make changes

**Make changes here** when the task concerns:
- Astro/Starlight components and renderers: `src/components/`, `src/pages/`, `src/scripts/`, `src/routeData.ts`, `src/content.config.ts`.
- Shared presentation, themes, layout, asides, responsive styling: `src/styles/`.
- Reusable tree/front-end code: `public/tree/`.
- Shared build, graph, media, navigation, and checks: the engine-owned paths explicitly listed in `scripts/sync-engine-to-content.mjs`.
- Engine-side tests, technical docs, package/dependency requirements and synchronization workflow.

**Do not add here**:
- Real biographies, family trees, original evidence, private photos, personal imports, or other site-specific data.
- Real family records under `src/content/docs/`; this engine's documents are **synthetic test/demo fixtures only**.
- The site's `astro.config.mjs`, domain settings, secrets, Cloudflare configuration, site media, or editorial rules.
- Credentials or generated artifacts.

## Engine-to-site synchronization

1. Open or update a PR **in this repository** for changes to shared engine files.
2. Run `npm ci`, `npm run check`, and `npm run build` with synthetic data. The `Engine CI` workflow verifies PRs.
3. After merge to `main` and successful CI, `.github/workflows/ci.yml` uses the repository secret `GENEALOGY_CONTENT_PUSH_TOKEN` to synchronize **only** allowlisted engine files into `Antiokh/genealogy-antiokh/main`.
4. The sync creates/updates `.genealogy-engine-managed.json` in the site repository. Do not edit this manifest by hand or broaden the allowlist without reviewing the destination paths and initial-diff protection.
5. Check the resulting `genealogy-engine[bot]` commit and the site's build/Cloudflare deployment before declaring a release complete. GitHub CI success alone does not prove deployment.

The site owns `scripts/check-public-person-catalog.mjs`, whose examples reflect its real data; the engine has its own synthetic version. **Do not add that path to the sync allowlist.**

## Changes requiring coordination

The sync does **not** transfer `astro.config.mjs`, `package.json`, lockfiles, `src/assets/`, `src/content/docs/`, `demos/`, `imports/`, `research/`, or site-only workflows/scripts. If an engine change requires configuration, dependencies, or new routes in the production site, make a **separate reviewed change** in `Antiokh/genealogy-antiokh` as part of the same task. Do not assume the auto-sync covers it.

For a content or editorial request, work in `Antiokh/genealogy-antiokh` instead. Do not copy real data into this public engine to reproduce a bug; use sanitized/synthetic fixtures.

## General agent workflow

- Read the target repo's `AGENTS.md` before editing it.
- Preserve the two-repository ownership boundary, existing URLs, and light/dark theme behavior.
- Use focused PRs for structural or cross-repository changes. Do not force-push over concurrent edits.
- Never include the sync token or other credentials in source, logs, PRs, or test fixtures.
- See `docs/engine-content-sync.md` for the exact synchronization contract.
