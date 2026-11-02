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

## Constraints and verification

- Only Lavalink v4 and NodeLink. Preserve OSL-3.0 and upstream credits.
- Keep existing public method return types; no Native Voice backend, PluginManager, or mandatory Socket.IO.
- The latest logging decision permits raw local debug text. Document credentials risk and do not silently redact it; historical canary/redaction tasks are superseded.
- External audio testing requires a dedicated fixture/server environment. Local tests do not certify Discord audio or backend compatibility.
- Official references: [Node test runner](https://nodejs.org/api/test.html), [pnpm frozen installs](https://pnpm.io/cli/install#--frozen-lockfile), [Consola](https://github.com/unjs/consola).

## Task index

See [todo.md](todo.md) for acceptance criteria, dependencies, and current completion state.
