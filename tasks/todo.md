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
- [ ] Commit and push a reviewable PR against dev, without publishing npm or merging unverified backend claims.

## Subsequent roadmap
- [ ] Node selection/health and bounded failover extraction.
- [ ] Backend capabilities and Lavalink v4/NodeLink integration matrix.
- [ ] Track resolution, persistence boundaries and gateway voice handling.
- [ ] Real audio/reconnection/long-duration performance checks and prerelease preparation.
