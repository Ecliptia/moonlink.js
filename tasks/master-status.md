# Estado consolidado del plan

Referencia: ZIP consolidado del 2 de noviembre de 2026, `00_ACTUALIZACIONES/DECISIONES_VIGENTES.md` y `FEATURES_Y_PLAN_DE_TRABAJO.md`, que prevalecen sobre el CSV histórico. Este documento no convierte una prueba local en certificación de audio Discord. Los enlaces de cada entrega en [todo.md](todo.md) contienen la evidencia técnica.

## Fases vigentes

| Fase | Estado y evidencia |
| --- | --- |
| 0 Baseline | Implementado: API heredada registrada, pnpm/lock, build, pruebas sin bot, CI Node 22/24, publicación bloqueada. |
| 1 P0 reproducción | Implementado: guard/cancelación, serialización, autoplay sin mutación temporal, comprobación de recuperación y volumen asíncrono; regresiones. |
| 2 Arquitectura | Implementado: selección/salud/failover, adaptadores, codec/resolver, StorageAdapter/Local y coordinación de voz gateway; integración local de ambos backends. |
| 3 Logging | Implementado: Consola opcional y silencioso, banner voluntario, estado/failover confirmados. Métricas disponibles por eventos/estado y runner; API de métricas compartida queda futura. Debug crudo por decisión vigente. |
| 4 Calidad/distribución | Implementación local y preparación privada: ejemplos, API/migración, tarball CJS/ESM/TS, búsquedas opcionales y pruebas de capacidades. La evidencia y los bloqueos externos están en release-readiness.md. Publicación y certificación de audio siguen pendientes. |
| Futuro | Native Voice excluido; PluginManager propio y Socket.IO fuera del núcleo. Redis, cluster, web/telemetría y funcionalidades opt-in dependientes de proveedores no son condiciones de esta entrega. |

## Conciliación del CSV histórico

| ID | Estado actual |
| --- | --- |
| P0-001, P0-002, P0-006 | Sustituidos por la decisión de conservar debug técnico crudo; advertencia y control de destino documentados. No se afirma redacción de secretos. |
| P0-003 a P0-005 | Completados: bloqueo npm, lock y runner sin credenciales. |
| P0-007 a P0-009 | Completados: marca/banner/créditos, empaquetado y CodeQL. |
| P1-010 | Tipos/errores y contratos HTTP/WS implementados; no se sustituye el transporte por una dependencia sin evidencia de beneficio. |
| P1-011 a P1-018 | Contratos locales, orden, loop/autoplay, selección, sesiones y failover implementados/probados. La parte “saneado” de P1-018 fue sustituida por la decisión vigente de logs. |
| P1-019 | Parcial: staging local reproducible; happy path de audio Discord bloqueado por ausencia de bot/canal dedicados. |
| P1-020, P1-021 | Detección y protocolo NodeLink locales probados; reproducción audible pendiente. |
| P2-022 | Parcial: tipos, listado, rutas deshabilitadas, errores de capa inexistente y falta de reproducción activa. Crear/mezclar/eliminar capas durante audio real requiere fixture de reproducción. |
| P2-023 | Parcial: wrappers tipados, letras vacías y capítulos HTTP vacíos sin proveedores. “Found”, idiomas y eventos temporizados requieren proveedores/pistas apropiados. |
| P2-024 | Endpoint, auth, WAV local, errores HTTP acotados y ruta deshabilitada probados. WAV HTTP revela limitación de la imagen fijada; no se certifican todos los codecs. |
| P2-025 | Payloads inválidos y operaciones/eventos desconocidos no rompen el cliente en pruebas. Recorridos extendidos con audio/proveedores siguen pendientes. |
| P2-026, P2-027 | Implementados y probados: fallback/configuración de resolver, cancelación, timeout y caché TTL/LRU opt-in con requester aislado. |
| P2-028, P2-029 | Implementados: migración/API, ejemplos JS/TS, instalación real del tarball y consumidores CJS/ESM/TS. |
| P2-030 | Resuelto por el usuario: nyxlink, versión elegida 0.1.0-dev.1; privado. Disponibilidad de un nombre no acredita titularidad npm. |
| P2-031 | Preparado para revisión privada; release pública bloqueada por validación externa, Qodana y titularidad/autorización de publicación. |
| P2-032 | Benchmark y endurance locales registrados; no garantizan rendimiento de producción. Ver docs/stability.md para duraciones realmente ejecutadas. |
| P2-033 | Licencia OSL-3.0 y avisos originales conservados, bytes del LICENSE verificados dentro del tarball. No se afirma dictamen legal externo. |
| P3-034, P3-035 | Futuros/opt-in: recepción de voz y YouTube LiveChat heredados no certificados en un servicio real. |
| P3-036 | StorageAdapter inyectable implementado; proveedor Redis/multiproceso futuro. Local está limitado a un proceso. |
| P3-037 | API de métricas externa/privada futura; no se añade servidor web al núcleo. |
| P3-038 | Refactor gradual realizado en reproducción/autoplay, búsqueda, nodos, backend, tracks y voz; no se reescribe Node/Player completos ni se promete API futura. |

## Dependencias evaluadas

Se retienen HTTP/WebSocket existentes con contratos de ambos backends y `node:test`/TypeScript como herramientas actuales. Consola es la única nueva dependencia runtime. `ws`, Vitest, fast-check, tsdown, ESLint, publint, attw, Zod, lru-cache y prom-client eran alternativas a evaluar, no una lista de instalaciones obligatorias. La validación directa del tarball cubre imports y declaraciones sin exigir un cambio de bundler. No se añade Redis sin un caso multiproceso definido.

## Integración de ramas

El usuario fusionó PR #1/#3/#4/#5 en sus bases apiladas. `dev` recibió la primera entrega; la cuarta completa quedó en `feat/nyxlink-track-storage`. La entrega final se revisa contra `dev` para consolidar el historial completo. No se cambia la rama predeterminada ni se fusiona automáticamente.
