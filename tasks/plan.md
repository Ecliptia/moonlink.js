# NyxLink: foundation and playback reliability

Source: the consolidated master package supplied on 2026-11-02. Its current decisions override the historical backlog. Base: `dev` at `f6631bb289aee180af48cb4f0f1671e5e075249c`. Work on `feat/nyxlink-foundation`; review through a PR to `dev`.

## First implementation delivery

1. Reproducible baseline: pin the existing pnpm version and lock, separate automated tests from the manual Discord bot, record the public API, validate the package, and disable inherited automatic publication. Keep the approved README banner and Moonlink attribution.
2. Cancel obsolete autoplay work on stop, disable, destroy, and explicit playback. Resolve recommendations without changing the current track. Serialize player commands and test deferred searches and REST responses.
3. Report playback and node recovery success only after a successful result. Preserve synchronous `setVolume` and add an awaitable alternative with documented error handling.
4. Integrate the supplied Consola logger as optional output, preserving legacy debug events. Render only measured node state and confirmed failover outcomes.

Each increment must pass typecheck, deterministic tests, build, and package validation before its commit. API changes are additive; no source-tree replacement with the architecture templates. No npm publication or real Discord-bot control is authorized by this implementation.

## Later deliveries

- Extract node selection/health/failover and backend capability contracts behind regression tests.
- Validate Lavalink v4 and NodeLink separately against actual server versions, including audio, reconnection, lyrics, mixer, and opt-in voice receive.
- Add source/track resolution and persistence boundaries, then performance and long-duration tests.
- Choose the final npm identity and release version before a separately authorized prerelease.

## Second implementation delivery

Branch: `feat/nyxlink-backends`, based on the first delivery at `d839c42`. PR #1 remains open, so review this delivery as a stacked PR against `feat/nyxlink-foundation`.

1. Extract node health and selection, preserving findNode and legacy strategies. Exclude destroyed/disconnected nodes, apply exclusions before READY preference, handle missing/non-finite statistics deterministically, and keep existing players on their nodes.
2. Introduce typed Lavalink/NodeLink adapters and strict identity/capability detection from observed info/headers. Preserve REST/WebSocket transport and public isNodeLink/capabilities. Optional endpoints remain unavailable until their capability is established.
3. Extract bounded failover across distinct healthy candidates. Preserve queue, position and user cancellation, aggregate only confirmed transfers, avoid duplicate concurrent recovery and clean up reconnect timers/sockets on node destruction.
4. Add repeatable local protocol tests with real Lavalink v4 and NodeLink versions pinned by image digest, using isolated loopback ports and generated media. Cover auth, ready/info/stats, load/decode, player mutations without voice, session resume/new-session and unavailable extras.

The user explicitly confirmed there is no dedicated Discord test bot. Do not connect existing bots or send Discord voice credentials. Local real-server protocol checks and deterministic playback/voice contract tests must be reported separately from audible Discord playback, which remains pending.

## Third implementation delivery

Branch: `feat/nyxlink-track-storage`, stacked on `feat/nyxlink-backends` at `53602f5`; neither earlier draft is merged by this work.

1. Define StorageAdapter and allow an injected adapter while retaining built-in memory/local configuration. Serialize mutations and provide a flush barrier. Fix local clear/WAL continuity, unsafe dotted paths and error handling with temporary-directory regressions; keep existing snapshot/WAL readable.
2. Add TrackCodec for metadata-rich snapshots with legacy encoded-only reads. Add TrackResolver to load a track on its destination backend before migration, retain requester/userData/queue/position, and reject unresolved or cancelled migration before old-player deletion. Resolve queued tracks lazily when their backend differs. Preserve original public encode/decode signatures.
3. Extract VoicePacketHandler validation. Coordinate gateway state/server packets in either order, deduplicate in-flight updates, ignore obsolete acknowledgements after token/session changes, disconnect or destroy, and clean up promises/listeners/timers. Backend acknowledgement is not proof of audible Discord playback.
4. Verify unit/contract and public TypeScript consumers, local persistence reload, and pinned real-server track resolution in both directions without sending voice credentials. Document limits, commit/push and open a stacked draft PR; verify Node 22/24, backend protocol and CodeQL CI. Missing Qodana token remains an external limitation.

No new runtime dependency, native voice transport, Discord bot, npm publication, or merge is part of this delivery. Existing default database configuration is retained for compatibility; custom adapters are opt-in. Local disk storage is single-process and its await contract does not claim power-loss durability.

## Constraints and verification

- Only Lavalink v4 and NodeLink. Preserve OSL-3.0 and upstream credits.
- Keep existing public method return types; no Native Voice backend, PluginManager, or mandatory Socket.IO.
- The latest logging decision permits raw local debug text. Document credentials risk and do not silently redact it; historical canary/redaction tasks are superseded.
- External audio testing requires a dedicated fixture/server environment. Local tests do not certify Discord audio or backend compatibility.
- Official references: [Node test runner](https://nodejs.org/api/test.html), [pnpm frozen installs](https://pnpm.io/cli/install#--frozen-lockfile), [Consola](https://github.com/unjs/consola).

## Task index

See [todo.md](todo.md) for acceptance criteria, dependencies, and current completion state.

## Fourth implementation delivery

Branch: `feat/nyxlink-stability`, stacked on the third delivery at `1152f1e`.

1. Measure queue batching and lifecycle retention with a reproducible, bounded benchmark. Report measured heap/CPU/timing and environment, without inventing a production latency SLA.
2. Add idempotent Manager.shutdown and initialization coordination. Close players, nodes, connectors/logger, idle timers and storage; reject new work after shutdown. Remove destroyed-player snapshots and release tracked WebSocket heartbeat/manual-ping resources with independent regression tests.
3. Add a real-server endurance runner against the pinned images: ten-minute local validation and a shorter CI smoke run. Exercise repeated REST lifecycle/load/decode, paused player commands without voice, confirmed session resumes, bounded queues and teardown. Sample client/server memory, CPU, event-loop delay and latency percentiles. Longer one-hour runs remain available and are not claimed until executed.
4. Record evidence, prerelease blockers and rollback/reproduction instructions. Keep package private, retain identity/version until a separate distribution decision, open a stacked draft PR and verify CI. Audible Discord/DAVE and real playback latency remain untested.

## Final local validation and consolidation

Branch: `feat/nyxlink-validation`, starting from the user-merged fourth delivery (`8e74b49`, same runtime files as `a40a138`). PRs #1/#3/#4/#5 were merged into their respective bases, so this delivery will target dev and consolidate the complete tree for review.

1. Run the existing pinned-server endurance for 3600 real seconds, preserve its unmodified test conditions and record client/server metrics and cleanup. This remains a protocol/REST test without Discord voice.
2. Apply the user's distribution choice: npm name nyxlink (lowercase), initial own version 0.1.0-dev.1; retain private/publication protections. Validate actual packed installation for CommonJS, ESM and TypeScript consumers on supported Node versions.
3. Close remaining developer-facing acceptance: compiled examples, migration/API documentation, explicit status of the historical backlog against superseding decisions. Implement/test any in-scope search optional contracts and NodeLink local endpoint cases that can be verified without a bot, recording remaining external provider/audio limitations precisely.
4. Consolidate in a reviewable PR against dev with all earlier approved delivery history, full local/CI evidence and a finite remaining external checklist. No npm publication, repository-default-branch change, production Discord control or automatic merge is authorized here.
