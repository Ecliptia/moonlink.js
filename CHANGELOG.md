# Changelog

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
