# Implementation checklist

## 1. Baseline (no dependency)
- [x] Pin pnpm; install with frozen lock; record Node/npm/compiler versions and the original commit in docs/development.md.
- [x] Keep npm test credential-free; preserve the manual bot as test:bot; verify public exports and TypeScript consumer declarations.
- [x] Block automatic package publication, use Node 22/24 validation, and check the package allowlist with pack:check.

## 2. Autoplay cancellation (depends on 1)
- [x] Deferred recommendations cannot play after stop, disable/re-enable, destroy, or newer playback.
- [x] Recommendation lookup never changes current; concurrent attempts cannot overwrite newer recommendations or emit false autoPlayed.
- [x] Prove regressions fail on the original source and pass after the fix.

## 3. Command order (depends on 2)
- [x] Play/stop/pause/resume/seek and destruction preserve invocation order at the backend; rejection does not poison the queue.
- [x] Deferred playback cannot complete after stop/destroy or overwrite a newer explicit request.
- [x] REST null/failure does not count as successful playback; aborted work does not pollute queue/history.

## 4. Recovery and volume (depends on 3)
- [x] Failed restart/transfer emits no success; preserve tracks, queue, volume, pause state and position on valid transfer.
- [x] Keep chainable setVolume; offer setVolumeAsync with errors and backend acknowledgement.
- [x] Tests cover accepted, rejected and empty backend responses.

## 5. Optional logger (depends on 4)
- [x] Integrate supplied Consola formatter and export Logger; default stays silent and banner is opt-in.
- [x] Connect legacy debug, live node status and real failover lifecycle without printing invented metrics.
- [x] Tests cover levels, formatting, opt-in output, listener cleanup and success/failure panels.

## Delivery checkpoint
- [x] Frozen install, typecheck, full deterministic tests, build and tarball validation pass.
- [x] Document API changes, known limitations and pending backend integration tests.
- [x] Commit and push a reviewable PR against dev, without publishing npm or merging unverified backend claims: [PR #1](https://github.com/melodiabl/NyxLink/pull/1).

## Subsequent roadmap
- [x] Node selection/health and bounded failover extraction (second delivery).
- [x] Backend capabilities and local Lavalink v4/NodeLink protocol matrix; audible Discord audio remains pending.
- [x] Track resolution, persistence boundaries and gateway voice handling (third delivery; real Discord audio remains pending).
- [x] Local reconnection, one-hour protocol endurance, resource analysis and private prerelease preparation.
- [ ] Audible Discord/DAVE, provider-backed extensions and external release conditions: see docs/release-readiness.md.

## Second delivery: nodes and local backend validation

- [x] S1: NodeHealthMonitor and NodeSelector extraction; regressions for exclusion order, stale READY, missing/non-finite stats, strategies and player affinity. Verify node-selection tests plus the full suite.
- [x] S2: BackendAdapter, LavalinkAdapter, NodeLinkAdapter and detector; strict boolean/header markers, version/capability snapshots, reconnect resets and safe feature errors. Verify backend contract tests and TS consumer.
- [x] S3: Bounded NodeFailover with candidate exclusion, cancellation and concurrency control; reconnect/destroy resource cleanup. Verify recovery tests including multiple candidates and shutdown during reconnection.
- [x] S4: Reproducible local Lavalink/NodeLink protocol harness, immutable versions and isolated HTTP media; real auth/REST/WebSocket/session tests. No Discord bot or audio connection.
- [x] S5: Record the evidence matrix and remaining Discord-audio limitations, run quality/package checks, commit, push and open the second PR: [PR #3](https://github.com/melodiabl/NyxLink/pull/3).

## Third delivery: tracks, storage and gateway voice

- [x] T1: StorageAdapter injection/flush ordering; local reload, clear, safe-path and failure regressions.
- [x] T2: TrackCodec snapshots and TrackResolver; migration/queue cancellation tests and metadata preservation.
- [x] T3: VoicePacketHandler and race-safe voice handshake; malformed/foreign packets, event order, duplicate credentials, disconnect/destroy and listener cleanup regressions.
- [x] T4: Real pinned-server track resolution, documentation, public types/package checks, commits, stacked [PR #4](https://github.com/melodiabl/NyxLink/pull/4) and [CI evidence](../docs/tracks-storage-voice.md#verificación-en-github).

## Fourth delivery: stability and measurement

- [x] P1: Reproducible queue/resource baseline and cleanup regressions.
- [x] P2: Coordinated Manager shutdown, connector cleanup, destroyed snapshot removal and bounded WebSocket ping resources.
- [x] P3: Real-server endurance runner and ten-minute local evidence; shorter CI smoke, latency/resource metrics and cleanup checks.
- [x] P4: Readiness/limitations documentation, public types/package verification, commits, stacked [PR #5](https://github.com/melodiabl/NyxLink/pull/5) and [CI evidence](../docs/stability.md#verificación-en-github).

## Final local validation and consolidation

- [x] V1: One-hour pinned-server endurance evidence and resource/latency analysis.
- [x] V2: Authorized nyxlink@0.1.0-dev.1 identity with publication blocked; installed tarball CJS/ESM/TS validation.
- [x] V3: Compile bot examples, migration/API docs and explicit master-backlog status; close remaining testable local contracts.
- [x] V4: Consolidated PR against dev, quality/package checks and CI evidence; preserve external audio/publication blockers.

Final consolidation: [PR #6](https://github.com/melodiabl/NyxLink/pull/6), [validation evidence](../docs/validation.md) and [one-hour report](../docs/performance/endurance-3600.json). External conditions remain explicit above; this does not mark Discord audio or publication complete.
