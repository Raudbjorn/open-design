# Impact-5 fork integration

Authorized scope: integrate every feature rated impact 5 in the 2026-10-15 fork audit. Initial baseline: `7abd6fc2b11987c3940eb4ffc461478ff37c0b33`. Destination: `Raudbjorn/open-design`; working branch: `integrate/impact-5`.

The selection is exactly 14 features from the rated inventory. Provisional watchlist scores are discovery leads, not implementation-ready additions; they remain outside this list until their source is reviewed. Lower-impact pieces are included only when a selected feature depends on them. No complete donor branch is adopted.

## Progress

| ID | Behavior | Pinned donor | Status |
|---|---|---|---|
| M1 | Full-canvas PNG export with content-box cropping and tall-image band stitching | [mutoe/open-design@fbbcc3a24073](https://github.com/mutoe/open-design/tree/fbbcc3a24073e1f7b26de84aed98f5cf67afc591) | integrated; validation below |
| D2 | Verified backups, staged mutations, recovery journal and explicit recovery actions | [ReturningAI/open-design@9765e3fc9657](https://github.com/ReturningAI/open-design/tree/9765e3fc965775ef3448d44c64c03483d7210523) | queued |
| D3 | Three-way draft refresh using source, workspace and saved baseline | [ReturningAI/open-design@9765e3fc9657](https://github.com/ReturningAI/open-design/tree/9765e3fc965775ef3448d44c64c03483d7210523) | queued |
| D4 | Immutable published snapshots with file manifests and hash verification | [ReturningAI/open-design@9765e3fc9657](https://github.com/ReturningAI/open-design/tree/9765e3fc965775ef3448d44c64c03483d7210523) | queued |
| B1 | Project-scoped browser command broker and desktop CDP execution | [gautam-achieveai/open-design@009cb587de95](https://github.com/gautam-achieveai/open-design/tree/009cb587de95bf118dfedfcca21c4b6387d7adad) | queued |
| B3 | Unified annotations across embedded previews and external browser capture | [gautam-achieveai/open-design@009cb587de95](https://github.com/gautam-achieveai/open-design/tree/009cb587de95bf118dfedfcca21c4b6387d7adad) | queued |
| W1 | Register another machine as a worker using its installed agents and credentials | [MafedoXor/open-design@44df05ed95e3](https://github.com/MafedoXor/open-design/tree/44df05ed95e370818eaf15c7ccc245cb749359f2) | queued |
| W2 | Run on a selected worker and stream results into the existing chat | [MafedoXor/open-design@44df05ed95e3](https://github.com/MafedoXor/open-design/tree/44df05ed95e370818eaf15c7ccc245cb749359f2) | queued |
| W3 | Conflict-aware transfer: retain concurrent server edits and save worker conflict copies | [MafedoXor/open-design@44df05ed95e3](https://github.com/MafedoXor/open-design/tree/44df05ed95e370818eaf15c7ccc245cb749359f2) | queued |
| Y2 | Validate compaction output before replacement; bounded retry and explicit failure | [MuhammadHaikal2005/open-design@0eb41f1c3e51](https://github.com/MuhammadHaikal2005/open-design/tree/0eb41f1c3e5166dc21da0639a126c7520fc04e45) | integrated; opt-in; validation below |
| V1 | Browser-backed prototype audits across viewports and declared interaction states | [latent-era/open-design@81ac153e3330](https://github.com/latent-era/open-design/tree/81ac153e3330791f6f7fb7043ef39324c74b2e25) | queued |
| V3 | Broader text-file version capture and chat-turn rewind | [latent-era/open-design@81ac153e3330](https://github.com/latent-era/open-design/tree/81ac153e3330791f6f7fb7043ef39324c74b2e25) | queued |
| P1 | First-class runnable React/Next project scaffolding and creation flows | [posicube-services/robi-design-studio@e9fdc157d11d](https://github.com/posicube-services/robi-design-studio/tree/e9fdc157d11dc1da38bc7a94b7efcdb02b2076a1) | queued |
| P2 | Managed development server, build status/logs, and live/static previews | [posicube-services/robi-design-studio@e9fdc157d11d](https://github.com/posicube-services/robi-design-studio/tree/e9fdc157d11dc1da38bc7a94b7efcdb02b2076a1) | queued |

## Integration sequence and required closure

1. **Y2 — validated compaction.** Use the current BYOK launch path shared by UI/CLI. Include only the endpoint-specific budget/plugin prerequisites. Preserve defaults for unmatched providers. Test rejected summaries, retries, byte preservation, aborts and actual CLI compaction against a local stub.
2. **M1 — full-canvas export.** Include explicit viewport/full capture intent where required. Close desktop, browser, daemon, sidecar DTO and existing CLI export consumers together. Validate crop/tall-image geometry, fonts, resource limits and cancellation.
3. **D2/D3/D4 — safe design-system lifecycle.** Establish persisted ownership and baseline prerequisites; recreate current migrations deliberately. Add conflict inspection, verified snapshots, backups/recovery and UI/CLI operations. Test interruption/restart and authored-data preservation.
4. **V3 — coherent run rewind.** Record previous versions across affected text files, detect later external changes, expose affected-file preview and recovery. Close API, CLI, UI and persistence as one slice.
5. **B1/B3 — scoped browser interaction and annotations.** Include leases, authority, bounded payloads, cancellation and annotation draft ownership. Start with local preview inspection, then consequential actions and external capture.
6. **V1 — rendered verification.** Reuse the browser execution boundary; emit source-hash-bound viewport/state receipts and explicit unchecked states. Optional checks must not claim successful verification when unavailable.
7. **W1/W2/W3 — authenticated remote workers.** Include token lifecycle and concurrency prerequisites. Coordinator owns committed state; workers return bounded, base-hash-bound changes. Keep browser auth and reject legacy transfers that bypass conflict detection.
8. **P1/P2 — executable React/Next projects.** Begin with one maintained scaffold; integrate process supervision, isolated build authority, UI/CLI entry points and previews. Enforce timeouts, process-tree cancellation and explicit dependency changes before adding more variants.

## Source and safety boundaries

- Preserve current sidecar/package ownership, runtime data-root authority, project authorization, and UI/CLI parity.
- Preserve the user's pre-existing package.json edits and local audit/export files outside integration commits.
- Do not inherit auth-disabled deployment, bind-all/private-network relaxations, donor branding, Windows/macOS/ARM packaging, or unreviewed customer templates.
- Keep provenance per implementation commit. Source inspection is not build/runtime evidence.
- Each completed slice needs focused regression tests, package validation, root guard/typecheck and an explicit statement of untested behavior. Full daemon/web test suites remain CI work under repository policy.

## Validation log

- Baseline: Node 24.21.0, pnpm 10.33.2; existing BYOK provider suite: 27 tests passed.
- Y2: 56 focused provider/profile/plugin tests passed; five real OpenCode 1.18.18 CLI scenarios passed against a local stub. Session exports retain original messages and contain an accepted checkpoint only after valid compaction. Two shared chat-launch cases passed (profile enabled/disabled).
- Y2 regression evidence: the new profile tests failed before implementation (9 failed, 2 passed); they pass after wiring the validated policy into the shared launch path.
- M1: 48 focused desktop tests passed, including one real Electron test covering seven synthetic pages and the final pixels of an 18,000-pixel image. 106 focused web export tests passed.
- M1 regression evidence: all 16 initial donor geometry tests failed before implementation. A real Linux render caught scrollbar gutters defeating narrow-column detection; the corrected fixture passes.
- Root `pnpm guard` and `pnpm typecheck` passed. Daemon and desktop package builds passed. `git diff --check` passed. No dependencies were added.
- Implementation commits: Y2 `b2ba9461d0`; M1 `a156a80814`.

## First integration batch

Two of the 14 selected features are implemented on the integration branch; the other 12 remain queued. [Compaction configuration and limits](../byok-compaction.md) and [image export behavior and limits](../image-export-cropping.md) explain how to use and verify this batch.

M1 reuses the existing scoped daemon/sidecar/CLI export pipeline and its memory-bounded scroll stitch. No new API or DTO was necessary. Cropping is deliberately more conservative than the donor around shadows, generated content, non-finite geometry and asymmetric layouts. The narrower layout hides native scrollbars only in its private capture window so Linux scrollbar gutters do not falsely trigger overflow.

Y2 is opt-in for an exact endpoint/model pair. No live profile or credentials were changed. The host OpenCode 2.0.29 rejects this checkout's existing `--dir` invocation; actual compaction was verified with a temporary trusted 1.18.18 binary, not by replacing the user's installation.

## Not claimed

Queued rows are not implemented. Fork creation and planning do not establish feature parity, migration safety, arbitrary real-world export fidelity, remote-worker behavior or generated-project isolation.
