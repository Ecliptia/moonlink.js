# Segunda entrega: nodos y protocolo local

La implementación se revisa sobre `feat/nyxlink-backends`, encima de la primera entrega. El usuario confirmó que no existe un bot de pruebas; no se conectaron bots ni se enviaron credenciales de voz de Discord.

La [tercera entrega](tracks-storage-voice.md) amplía esta matriz con resolución de pistas entre backends; los límites de migración descritos aquí corresponden al segundo bloque.

## Versiones reproducibles

| Backend | Versión observada | Referencia inmutable |
| --- | --- | --- |
| Lavalink | 4.2.2 | `ghcr.io/lavalink-devs/lavalink@sha256:96be2be7ee50d35a9bd42c8c7b99e2a4b741f09123066c1ebb9e014dd7db204d` |
| NodeLink | 3.10.0-dev.2026-10-20.1 | `ghcr.io/performanc/nodelink@sha256:19d8f9a8951d0e13f21977aac7e5ec4dc3199526b8dcb28e9c8a2e3ac058dfe8` |

La imagen de NodeLink identifica el commit `804e0d6d0f1af30384e0a2d12ddbc8d79e85cf35`. La configuración solo habilita fuentes HTTP/local, usa un WAV generado por la prueba y desactiva los endpoints de streaming directo. Las imágenes son procesos de prueba externos a la biblioteca; no se incorporan a su paquete ni administran nodos del bot.

## Matriz con servidores reales

| Comprobación | Lavalink | NodeLink |
| --- | --- | --- |
| WS ready, identidad, versión, info y stats | Correcto | Correcto |
| Cargar/decodificar/buscar audio HTTP local | Correcto | Correcto |
| Crear, actualizar y borrar player REST sin voz/audio | Correcto | Correcto |
| Error explícito al pedir una extensión no disponible | Correcto | Correcto |
| Reconectar y reanudar una sesión confirmada | Correcto | Correcto |
| Obtener sesión nueva cuando resume está desactivado | Correcto | Correcto |
| Credenciales incorrectas: fallo de autenticación sin bucle | Correcto | Correcto |
| Audio audible, DAVE y gateway real de Discord | No probado | No probado |
| Mixer audible, letras/proveedores, recepción de voz y streaming habilitado | No probado | No probado |
| Carga sostenida, CPU/memoria y desconexiones de larga duración | Pendiente | Pendiente |

La evidencia saneada está en [backend-protocol-evidence.json](backend-protocol-evidence.json). Se verifican 14 casos de protocolo, distribuidos entre dos servidores. El runner informa también los dos grupos contenedores de casos; una prueba fallida no se convierte en un resultado positivo en el JSON.

## Selección y salud

`findNode()` delega en NodeSelector y conserva las estrategias heredadas. Primero excluye nodos destruidos/desconectados y los IDs solicitados, luego considera salud y preferencia READY. Un READY excluido no oculta un nodo conectado alternativo. Prioridad menor gana; uptime mayor gana; los empates conservan el orden de inserción.

NodeHealthMonitor observa stats sin crear timers ni mover players. Informa `healthy`, `unhealthy`, `unknown` o `unavailable`. Datos ausentes, incompletos, no finitos o antiguos no se presentan como una medición saludable. `maxStatsAgeMs` predetermina 120000. La selección ordinaria mantiene el fallback heredado si todos están sobrecargados; el failover exige candidatos que no estén medidos como sobrecargados. Una llamada a selección nunca rebalancea players existentes.

## Identidad y capacidades

BackendDetector reconoce Lavalink v4 y los marcadores explícitos de NodeLink. Una cadena truthy como `"false"` no habilita extras. BackendAdapter/LavalinkAdapter/NodeLinkAdapter comparten el mismo transporte REST v4; no duplican comandos ni crean un tercer backend.

Las fuentes y filtros se toman de `/v4/info`. Los endpoints opcionales empiezan como `unknown`: ser NodeLink no prueba que estén habilitados. Una solicitud explícita aceptada marca su capacidad como disponible. Una respuesta que identifica una ruta desactivada/no implementada la marca como no disponible y produce FeatureUnavailableError. Un 404 de player inexistente conserva el estado desconocido y se entrega como HttpError, con status y cuerpo acotado; no se interpreta como ausencia del endpoint. Una reconexión descarta las capacidades observadas de la conexión anterior.

## Recuperación y límites

NodeFailover intenta hasta tres destinos distintos por defecto (configurable entre 0 y 10), comparte la recuperación en curso por player y comprueba cancelaciones del usuario entre operaciones. Conserva pista, posición, cola, volumen y pausa; una transferencia solo se agrega a `playersMoved` después de confirmarse. Una conexión fallida a un candidato no destruye el snapshot antes de probar el siguiente.

```ts
options: {
  node: {
    autoMovePlayers: true,
    avoidUnhealthyNodes: true,
    failover: { maxAttempts: 3, retryDelayMs: 100, preserveOnFailure: true },
  },
}
```

`preserveOnFailure` conserva el player/cola para intervención cuando se agotan destinos. Por defecto se mantiene la destrucción heredada ante una desconexión permanente. Destruir un nodo cancela sus timers y su socket; una continuación antigua de ready/resume no puede reactivar trabajo. Los errores WS 401/403 son terminales. Otros errores usan `retryAmount` y backoff desde `retryDelay`, con tope de cinco minutos. El contador se reinicia al recibir un ready válido; `retryAmount: 0` desactiva reintentos.

No se migran tracks entre backends confirmados diferentes ni entre identidad desconocida y confirmada: falta TrackResolver/TrackCodec. Para compatibilidad heredada se permite intentar entre dos nodos de identidad desconocida, con resultado comprobado; eso no certifica un codec ni un backend.

## Hallazgos corregidos por las pruebas reales

El proveedor Memory era un no-op y descartaba el ID de sesión. Ahora mantiene datos volátiles por Manager, con rutas anidadas y sin archivos. Esto habilitó la reanudación real en ambos servidores; la abstracción completa de almacenamiento sigue en el plan posterior.

Los errores comprimidos de NodeLink perdían su cuerpo. HttpError conserva ahora status y cuerpo JSON descomprimido con un máximo de 32 KiB. También se corrigió la pérdida del primer frame WS cuando llega junto al upgrade HTTP, la autenticación que no terminaba la conexión y el trabajo de recuperación que continuaba después de un cierre.

## Repetir las pruebas

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run test:types
pnpm run pack:check
pnpm run test:backends
```

El laboratorio requiere un host Linux con Podman (predeterminado) o `NYXLINK_CONTAINER_ENGINE=docker`. Usa puertos dinámicos de loopback y nombres propios; limita cada contenedor a una CPU/768 MiB, y no utiliza los contenedores de otros proyectos. Su configuración y contraseña aleatoria son temporales; el informe JSON no contiene contraseñas ni IDs de sesión. GitHub Actions ejecuta la misma matriz de protocolo y conserva ese informe como artefacto.

Fuentes primarias: [REST Lavalink v4](https://lavalink.dev/api/rest), [WebSocket y resume](https://lavalink.dev/api/websocket), [REST NodeLink](https://nodelink.js.org/docs/api/rest), [configuración NodeLink](https://nodelink.js.org/docs/config), [implementación info fijada](https://github.com/PerformanC/NodeLink/blob/804e0d6d0f1af30384e0a2d12ddbc8d79e85cf35/src/api/info.ts).
