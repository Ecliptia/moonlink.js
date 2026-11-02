# Changelog

## 0.1.0-dev.1 — NyxLink private development

- Authorized nyxlink package identity; installed tarball CommonJS/ESM/TypeScript checks and compiled JS/TS bot examples without login.
- Optional bounded search TTL/LRU cache, configured fallback/resolver, timeout and cancellation; default cache/fallback remain disabled.
- Streaming errors preserve bounded status/body and degrade disabled NodeLink capabilities consistently; enabled local WAV and explicit HTTP decoding limitation documented.
- API/migration reference and consolidated status of the supplied backlog; publication stays blocked.

## Unreleased — Lifecycle and stability measurement

- Add terminal, idempotent Manager.shutdown with ordered cleanup, shared initialization and aggregated failures.
- Dispose owned connector/logger callbacks and idle timers; remove destroyed-player snapshots after pending writes.
- Correlate WebSocket ping payloads and clear pending ping/heartbeat resources even when transport writes fail.
- 152 deterministic tests, including lifecycle/error cleanup and correlated ping resource regressions.
- Reproducible queue batching benchmark, real-backend endurance runner and short CI smoke; keep explicit limits on performance/audio claims.
- Local 600-second endurance passed: 601 player cycles, 37 confirmed resumes and 61 pings per backend; Node 22/24, protocol, CodeQL and 60-second CI smoke passed.
- Prerelease readiness documentation without changing package identity, version or publication protection.

## Unreleased — Tracks, storage and gateway voice

- Destination-side URI track resolution before cross-backend migration, with lazy queue resolution and cancellation before old-player deletion.
- Metadata-rich track snapshots, backend provenance and legacy encoded-only restoration; preserve requester, userData, position, queue and history.
- Injectable StorageAdapter, serialized mutations and flush/shutdown barriers; local WAL recovery after clear, torn records and write errors.
- Validated voice gateway packets, ordered/deduplicated credential updates and guards against stale acknowledgements, disconnect/destroy and reentrant listeners.
- 135 deterministic tests and 16 real-server protocol cases, including Lavalink→NodeLink and NodeLink→Lavalink resolution without Discord voice.
- Real Discord audio/DAVE, source-alternative matching, compatibility between different plugins of the same backend and long-duration checks remain unverified.

## Unreleased — Node and backend protocol delivery

- NodeSelector/NodeHealthMonitor: healthy selection, stable strategies and safe handling of incomplete/stale statistics.
- Typed backend identity/capability adapters; structured bounded HTTP errors and explicit unavailable-feature handling.
- Bounded per-player failover across distinct candidates, preserved stopped queues and verified voice-before-track restoration.
- WebSocket upgrade-head parsing, terminal authentication errors, bounded retries and cleanup of pending ready/resume work.
- Functional volatile Memory storage, enabling real session resumption without disk state.
- Real Lavalink 4.2.2 and pinned NodeLink protocol laboratory: 14 checks without Discord credentials or audio, plus 95 unit/contract tests.
- Local/CI evidence and compatibility matrix; audible Discord playback, cross-backend track resolution and sustained-load checks remain pending.

## Unreleased — NyxLink foundation

- Base de desarrollo fijada en Moonlink `dev` f6631bb, conservando API heredada, licencia y banner aprobado de NyxLink.
- Pruebas automáticas sin credenciales, contrato de exports y consumidor TypeScript; bot manual separado.
- Cancelación de autoplay y recuperación obsoletos, sin modificar current durante búsquedas ni emitir éxitos falsos.
- Comandos del player serializados; handshake de voz independiente para evitar bloquear el primer play.
- Propagación de errores HTTP en actualizaciones de player; 404 probado con HTTP local y recuperación fuera de la cola bloqueada.
- Transferencias verificadas, estados de failover y corrección de recuperación parcial entre nodos.
- `setVolumeAsync` y evento `playerVolumeError`, conservando el retorno encadenado de `setVolume`.
- Logger Consola Combinado opcional con banner, SYSTEM STATUS y NODE FAILOVER conectados al estado real.
- pnpm fijado, CI Node 22/24, allowlist del paquete y publicación heredada desactivada.

No hay publicación npm ni certificación de audio real. La matriz por versión de Lavalink v4/NodeLink continúa pendiente.
