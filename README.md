# Genealogy Engine

Public Astro/Starlight engine for a structured genealogy encyclopedia.

This repository contains the application engine, schema, tree renderers, generic build/check tooling, OG-card generation and a small synthetic dataset used only to keep the engine independently buildable.

Real family biographies, evidence, media, imports and reconciliation work intentionally live outside this public repository. A production content repository should pin an engine commit, overlay its private `src/content/docs` and local portrait assets, then run the normal checks/build from the private CI context.

The repository history was extracted from the original combined project with an engine allowlist. Content-only commits were dropped; mixed commits retain only their engine changes. Files whose earlier revisions mixed demo/family data were reintroduced from clean current versions instead of exposing their old history.
