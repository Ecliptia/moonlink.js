# Implementation checklist

## 1. Baseline (no dependency)
- [ ] Pin pnpm; install with frozen lock; record Node/npm/compiler versions and the original commit in docs/development.md.
- [ ] Keep npm test credential-free; preserve the manual bot as test:bot; verify public exports and TypeScript consumer declarations.
- [ ] Block automatic package publication, use Node 22/24 validation, and check the package allowlist with pack:check.

## 2. Autoplay cancellation (depends on 1)
- [ ] Deferred recommendations cannot play after stop, disable/re-enable, destroy, or newer playback.
- [ ] Recommendation lookup never changes current; concurrent attempts cannot overwrite newer recommendations or emit false autoPlayed.
- [ ] Prove regressions fail on the original source and pass after the fix.

## 3. Command order (depends on 2)
- [ ] Play/stop/pause/resume/seek and destruction preserve invocation order at the backend; rejection does not poison the queue.
- [ ] Deferred playback cannot complete after stop/destroy or overwrite a newer explicit request.
- [ ] REST null/failure does not count as successful playback; aborted work does not pollute queue/history.

## 4. Recovery and volume (depends on 3)
- [ ] Failed restart/transfer emits no success; preserve tracks, queue, volume, pause state and position on valid transfer.
- [ ] Keep chainable setVolume; offer setVolumeAsync with errors and backend acknowledgement.
- [ ] Tests cover accepted, rejected and empty backend responses.

## 5. Optional logger (depends on 4)
- [ ] Integrate supplied Consola formatter and export Logger; default stays silent and banner is opt-in.
- [ ] Connect legacy debug, live node status and real failover lifecycle without printing invented metrics.
- [ ] Tests cover levels, formatting, opt-in output, listener cleanup and success/failure panels.

## Delivery checkpoint
- [ ] Frozen install, typecheck, full deterministic tests, build and tarball validation pass.
- [ ] Document API changes, known limitations and pending backend integration tests.
- [ ] Commit and push a reviewable PR against dev, without publishing npm or merging unverified backend claims.

## Subsequent roadmap
- [ ] Node selection/health and bounded failover extraction.
- [ ] Backend capabilities and Lavalink v4/NodeLink integration matrix.
- [ ] Track resolution, persistence boundaries and gateway voice handling.
- [ ] Real audio/reconnection/long-duration performance checks and prerelease preparation.
