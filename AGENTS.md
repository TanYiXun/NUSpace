# AGENTS.md - NUS Maps

These rules apply to every Codex agent, other AI agent, developer, or automation working in this repository.

The project is a NUS campus map platform. The goal is to build a polished, map-first product with 3D campus context, transit layers, NUSMods venue intelligence, and eventually indoor navigation. The project must be implemented through verified data, careful prototypes, and strict design discipline.

Codex automatically discovers this file when it starts in the repository. Keep this file concise enough to fit Codex project-instruction limits. `PLAN.md` is the detailed product and implementation contract; this file defines how agents must behave while executing it.

## 1. Instruction Precedence

When instructions conflict, follow this order:

1. The user's latest explicit request.
2. This `AGENTS.md`.
3. `PLAN.md`.
4. Other repository documentation.

If the conflict changes product scope, data policy, external API use, visual direction, or implementation phase, stop and ask for clarification unless the user explicitly asked to update the plan.

`.agents/rules/workspace.md` exists only for tools that expect Antigravity-style workspace rules. Codex agents should treat this root `AGENTS.md` as the canonical automatically loaded instruction file.

## 2. Repository Shape

Implementation has not been scaffolded yet. Until it is, expect this repository to contain planning and instruction files only:

- `AGENTS.md`: canonical agent behavior rules for Codex.
- `PLAN.md`: detailed execution contract for the NUS Maps product.
- `.agents/rules/workspace.md`: compatibility pointer back to `AGENTS.md`.

When implementation begins, follow the repository shape in `PLAN.md` section 6.0 unless an ADR changes it.

## 3. First Action In Every Task

Before making any code, data, design, or documentation change:

1. Read the relevant `PLAN.md` sections for the requested phase or task.
2. If `docs/context-handoff.md` exists and the task is a continuation, resume, phase/prototype task, PR workflow, or ambiguous "continue" request, read it before acting.
3. Identify the exact section being worked on.
4. State the target phase and acceptance criteria.
5. Check whether the task touches external data, map geometry, API behavior, UI styling, or secrets.
6. If the task touches any source/API/data, confirm it is represented in `data/sources.yml` or add it before using it.

Read the full `PLAN.md` before starting a new milestone, creating an ADR, changing architecture, changing data-source policy, or declaring a phase complete.

## 4. Project Phasing Is Mandatory

Do not jump directly into the full MVP.

Follow this order:

1. Phase 0 prototypes.
2. Phase 0 review.
3. MVP 1 outdoor campus map.
4. Transit layer.
5. NUSMods intelligence.
6. 3D campus detail.
7. Indoor navigation.

Phase 0 is not optional. It must prove:

- base map rendering
- one 3D building
- one shuttle route overlay
- search and detail sheet
- data pipeline
- visual direction and map UI

Do not implement indoor navigation, live NUS ISB integration, account systems, or broad MVP features before the required gates in `PLAN.md` pass.

## 5. No Hallucinated Data

Never invent:

- API endpoints
- request parameters
- response fields
- building coordinates
- bus stop coordinates
- route geometry
- room numbers
- floor plans
- indoor corridors
- accessibility paths
- shuttle timings
- live vehicle locations
- API permissions
- licensing terms

If data is not verified, mark it explicitly as one of:

- `verified`
- `manually-curated`
- `prototype-placeholder`
- `manual-reference`
- `requires-permission`
- `unknown`
- `blocked`

Prototype data must use a `prototype_` prefix where practical and must not be presented as production truth.

## 6. Data Source Rules

All external data must be documented in `data/sources.yml`.

Required metadata includes:

- source owner
- source URL
- documentation URL
- terms/license URL
- license
- allowed use
- disallowed use
- attribution text
- whether attribution is required
- whether commercial use is allowed
- whether redistribution is allowed
- derived data rules
- date checked
- next review date
- source status
- used-for list
- limitations

Do not use a dataset in production if its status is:

- `prototype-placeholder`
- `manual-reference`
- `requires-permission`
- `blocked`
- `unknown`

Unless the UI explicitly labels the data state and the plan allows that phase to use it.

## 7. NUS Shuttle API Rules

NUS Internal Shuttle Bus data is sensitive from a production dependency perspective.

Known distinction:

- LTA DataMall: public Singapore bus data.
- NUS/uNivUS/ConnectX: NUS internal shuttle data.

Do not assume LTA DataMall provides NUS ISB routes like `A1`, `A2`, `D1`, `D2`, `K`, `P`, `R1`, or `R2`.

Do not use uNivUS/ConnectX/NUS live shuttle APIs in production unless official access exists.

Acceptable proof of official access:

- written approval from NUS, uNivUS, ConnectX, or relevant data owner
- signed API/data agreement
- public API documentation that explicitly permits the intended use
- project-specific approval from an authorized NUS office

Not acceptable:

- copied app tokens
- credentials found in frontend bundles
- mobile app reverse-engineering
- network-trace tokens
- old workshop credentials
- “the endpoint works”
- “another student project uses it”

If official access is unavailable, implement static, estimated, unavailable, or permission-required states exactly as described in `PLAN.md`.

## 8. Coordinate And Geometry Rules

Use WGS84 / EPSG:4326 for GeoJSON.

GeoJSON coordinates must be `[longitude, latitude]`, not `[latitude, longitude]`.

Validate NUS campus data against the bounds in `PLAN.md`.

Any manually authored geometry must include provenance:

- who/what created it
- when it was created
- reference source
- method
- estimated accuracy
- whether it can ship
- review status

Manually copied routes/buildings from screenshots, uNivUS, Google Maps, Apple Maps, Finute, or NTU Map cannot become production data without permission.

## 9. Design Direction Rules

The product must be map-first.

Primary reference:

- Apple Maps for restraint, legibility, hierarchy, camera behavior, and mobile polish.

Feature reference:

- NTU Map for campus-specific 3D, indoor cutaways, shuttle overlays, and room-to-room navigation ambition.

Desired result:

- Apple Maps-level restraint with NTU Map-level campus specificity.

Do not build:

- a landing page
- a generic dashboard
- a SaaS hero page
- a marketing site
- a component-library demo
- a crypto-style map dashboard
- a dark Dribbble shot that makes the map hard to read

The first screen must be the usable map.

## 10. Anti-Vibecoded UI Rules

Avoid these patterns unless an ADR explicitly justifies them and visual review passes:

- purple-to-blue gradients
- gradient hero text
- emoji in headings or map markers
- generic Inter-only typography without a typography decision
- colored-border feature cards
- glassmorphism or frosted panels that reduce map legibility
- low-contrast dark mode
- three icon cards in a row
- badge above every headline
- icon spam
- untouched shadcn/ui defaults
- fade-in-on-scroll
- cursor-following beams or glow trails
- decorative orbs, blobs, bokeh, or spotlights
- hover fade as the main feedback
- inconsistent one-off spacing
- generic buzzword copy
- serif italic accent words
- trendy font pairings without rationale
- grain textures over gradients
- oversized rounded cards floating over the map
- nested cards inside bottom sheets
- fake testimonials, pricing sections, feature grids, or marketing sections
- route colors chosen for vibes rather than route identity
- repeated bus markers until the map is unreadable

Every UI element must serve map use, navigation, search, route understanding, data trust, or accessibility.

Use the documented icon system in `docs/design.md` for map controls, sheet actions, markers, and menus. Do not mix raw text glyph buttons with symbol icons when a documented icon exists.

If a selectable map feature is implemented, it must be selectable directly on the map as well as through search or lists unless the phase explicitly documents why it is display-only.

## 11. UI Review Requirements

Any UI-affecting task must produce screenshots or visual notes for relevant states:

- mobile campus overview
- selected building
- selected bus stop
- route overlay
- bottom sheet collapsed
- bottom sheet expanded
- desktop pitched 3D view if 3D changed
- error/unavailable state if external data changed

Store accepted visual checkpoints in `docs/screenshots/` when practical. These checkpoints must be screenshots captured from the running app or deployed preview by the implementer, using browser tooling or equivalent. Do not use screenshots supplied by the user in chat, reference screenshots, mockups, competitor screenshots, or screenshots of GitHub as PR visual checkpoints. UI or map PRs should link those screenshots in the PR body so each prototype has a visible rollback and comparison record. If screenshots cannot be captured, the PR must say why and include specific visual QA notes.

Reject the UI if:

- the map is not the primary object
- controls look like mixed component-library defaults
- labels overlap route lines, buildings, controls, or markers
- bottom sheets hide too much map by default
- marker density is unreadable
- route colors are not distinguishable
- attribution disappears
- truth labels are missing
- any banned vibecoded pattern appears

## 12. Implementation Rules

Use TypeScript for app code unless the plan or an ADR says otherwise.

Use MapLibre GL JS as the Phase 0 default map renderer.

Use deck.gl only when it solves a real map overlay or animation problem.

Use Three.js only when MapLibre/deck.gl cannot provide the required 3D effect.

Do not scatter data loading inside UI components. Normalize data first, then render.

Keep UI components separate from:

- data adapters
- map source definitions
- schema validation
- external API calls
- routing algorithms

## 13. Build And Test Commands

No app scaffold exists yet, so build/test commands may be unavailable.

Once implementation begins, define these scripts in `package.json` or document the ADR-approved alternatives:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run validate:data
npm run build
```

If a command does not exist yet, report that it is not scaffolded instead of claiming it passed.

## 14. Testing Rules

When scripts exist, run relevant checks before completing work:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run validate:data
npm run build
```

If a command does not exist yet, document that instead of pretending it passed.

For data tasks, validation must check:

- source metadata
- coordinate order
- geometry bounds
- attribution requirements
- source status
- prototype data leakage

For UI tasks, validation must include at least one mobile viewport check.

## 15. Secrets And API Keys

Never commit secrets.

Never expose these in frontend code:

- LTA DataMall AccountKey
- NUS/uNivUS/ConnectX tokens
- backend credentials
- database credentials
- copied app tokens

External APIs that require secrets must go through server-side adapters or development-only mocks.

## 16. Documentation Rules

Update documentation when changing:

- data sources
- API assumptions
- visual direction
- map stack
- routing model
- indoor data model
- deployment behavior
- secrets/env requirements

Keep `README.md` current when a task changes the current prototype status, setup commands, generated-data workflow, local server behavior, or user-facing data policy. A stale README is a task-completion failure for prototype checkpoints.

Required docs once scaffolded:

- `README.md`
- `PLAN.md`
- `data/sources.yml`
- `docs/research-log.md`
- `docs/design.md`
- `docs/api-adapters.md`
- `docs/data-pipeline.md`
- `docs/decisions/`

## 17. Code Review Rules

When reviewing changes, flag:

- undocumented external data or API use
- unverified NUS shuttle access
- invented coordinates, routes, venues, rooms, floors, or response fields
- production use of placeholder or permission-required data
- map UI that violates the design direction or anti-vibecoded rules
- missing data validation for changed geometry or sources
- missing mobile visual review for UI changes
- secrets or copied app tokens in frontend, fixtures, docs, logs, or commits
- implementation that skips a required Phase 0 gate

Safe path: keep changes phase-scoped, source every dataset in `data/sources.yml`, label uncertainty in the UI, and update `PLAN.md` or an ADR when reality differs from the current plan.

## 18. Git And PR Workflow

Use small branches and PRs as phase/prototype checkpoints.

Before starting a new phase or prototype:

1. Check whether the latest completed phase/prototype has a committed checkpoint.
2. Check whether that checkpoint has been pushed to GitHub.
3. Check whether the checkpoint has been merged or otherwise recorded on `main`.
4. If any of those are missing, create the checkpoint before starting the next phase/prototype unless the user explicitly asks to skip it.

Branch rules:

- Use one branch per prototype or coherent task.
- Prefer branch names such as `prototype-a-base-map`, `prototype-b-building-extrusion`, or `docs/git-workflow`.
- Keep generated artifacts out of commits unless they are intentional deliverables.
- Never include secrets, copied app tokens, local environment files, or dependency folders.

Commit and PR text rules:

- Write plain engineering descriptions.
- Do not mention AI, LLMs, prompts, agents, generated code, or assisted implementation.
- Do not use em dashes.
- State what changed, how it was checked, and what remains pending.
- PR descriptions should include the targeted `PLAN.md` section, files changed, checks run, and remaining acceptance criteria.
- UI or map PR descriptions should include screenshot links or embedded images for the current visual state.

## 19. Context Handoff Rules

When a conversation becomes long, context-heavy, or likely to be continued in a fresh task, update `docs/context-handoff.md` before stopping if there is time.

The handoff note must be concise and factual. Include:

- current branch and latest local commit
- current phase/prototype and completion status
- what has been merged to `main`
- what remains unpushed, unmerged, or awaiting user approval
- commands/checks last run and their results
- current server or browser state if relevant
- important product decisions made in the conversation
- known issues, placeholders, and data-truth warnings
- exact next recommended action

Do not use the handoff file as a second plan. `PLAN.md` remains the contract. The handoff file is only the current working memory needed to resume safely after compaction or in a new task.

If compacting happens automatically, continue from the provided summary and then refresh `docs/context-handoff.md` at the next safe checkpoint.

## 20. Task Completion Checklist

Before saying a task is complete, report:

1. Plan section targeted.
2. Files changed.
3. Data sources added or used.
4. Tests/checks run.
5. Screenshots/visual review if UI changed.
6. Any incomplete acceptance criteria.
7. Any plan updates needed.
8. Any blocked items requiring user or official data-owner action.

For any UI or map-visible task, refresh or restart the local preview after branch changes, merges, generated-data updates, or dev-server uncertainty before judging the screen. If the current browser still appears stale, report the branch, commit, server URL, and whether the server was restarted.

Visible prototype labels must match the current checkpoint or the selected feature state. Do not leave an old prototype label as the default panel after completing a later prototype. If the current task has no UI change, either show a neutral current-phase overview or remove the prototype-specific default panel.

When starting or completing a new prototype or phase, search the repository for stale current-phase references from previous prototypes and update or remove them before claiming completion. This includes README current phase text, default app panels, screenshot captions, PR bodies, review docs, design docs, and any user-facing labels.

Do not claim live data, production readiness, or official API access unless the evidence is documented.
