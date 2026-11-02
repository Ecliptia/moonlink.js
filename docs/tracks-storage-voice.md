# Tercera entrega: pistas, almacenamiento y gateway de voz

Esta entrega se revisa sobre `feat/nyxlink-track-storage`, encima de la segunda. Conserva las firmas heredadas, el transporte REST/WebSocket y los backends Lavalink v4/NodeLink. No añade dependencias de producción.

## Pistas y transferencias

`TrackCodec.serialize(track)` conserva la codificación opaca, metadatos, posición, requester, userData, origen y backend. `TrackCodec.restore(snapshot)` admite esos snapshots y los registros antiguos `{ encoded, requester, position? }`. Las funciones heredadas de codificación/decodificación conservan su comportamiento; no se presentan como un codec universal para datos privados de plugins. Para snapshots nuevos se usa la información guardada, sin intentar interpretar esos bytes.

Las búsquedas hechas en un servidor etiquetan las pistas con su backend. Al migrar entre identidades confirmadas diferentes, TrackResolver carga la URI de la pista directamente en el destino **antes** de borrar el player original. Solo acepta un resultado único de tipo `track`, una codificación y metadatos válidos. NodeLink representa una duración HTTP desconocida como `-1`; se conserva ese valor observado.

Si la URI falta, la fuente no está disponible, el resultado es ambiguo o el usuario cancela, no se confirma la transferencia. No se adivinan equivalencias por título ni se elige automáticamente una pista de una búsqueda/playlist. Los adaptadores nativos Spotify/Deezer que necesitan stream también pasan por la URI del destino; esto requiere que ese servidor pueda cargarla. Las recomendaciones o proveedores alternativos quedan fuera de esta entrega.

La cola conserva su orden y se resuelve al reproducir cada elemento en el nuevo backend. Las pistas heredadas de cola/historial reciben y guardan la procedencia conocida antes de cambiar de nodo. Detener mientras hay una resolución pendiente conserva los elementos que aún no se han reproducido. Los errores de resolución no son una confirmación de reproducción.

```ts
import { TrackCodec, TrackResolver } from './dist';

const snapshot = TrackCodec.serialize(track);
const restored = TrackCodec.restore(snapshot);
const destinationTrack = await TrackResolver.resolve(restored, targetNode, sourceNode);
```

`transferNode()` y NodeFailover usan el resolvedor automáticamente cuando procede. La carga de resolución tiene un timeout de diez segundos y no repite automáticamente la solicitud. Entre backends del mismo tipo se conserva la reutilización heredada: **no se garantiza** compatibilidad entre plugins/versiones distintos del mismo backend. Los nodos de identidad desconocida siguen sin mezclarse automáticamente con nodos confirmados.

## Almacenamiento

StorageAdapter define `init`, `get`, `set`, `remove`, `has`, `keys`, `clear`, `shutdown` y un `flush` opcional. DatabaseManager acepta un adaptador configurado y serializa sus mutaciones; las lecturas esperan las escrituras previas. `flush()` espera esas operaciones y el flush del proveedor, si existe. Un error rechaza la operación que lo originó y no bloquea escrituras posteriores. `shutdown()` espera las operaciones anteriores y rechaza nuevas mutaciones.

```ts
import { Manager, Memory, type StorageAdapter } from './dist';

const adapter: StorageAdapter = new Memory(); // O tu implementación del contrato.
const manager = new Manager({
  nodes,
  send,
  options: { database: { type: 'memory', adapter } },
});
// Tras inicializar el manager:
await manager.database.set('application.checkpoint', { revision: 1 });
await manager.database.flush();
```

Cada instancia del adaptador pertenece a un solo Manager. El acceso directo al campo público `provider` evita la coordinación de DatabaseManager y debe gestionarlo la aplicación. Por compatibilidad se conserva el default heredado `local`; selecciona `memory` explícitamente para no escribir archivos.

Local reutiliza las rutas seguras de Memory y mantiene el formato anterior de snapshot y la lectura de WAL heredado. Las escrituras nuevas del WAL son registros JSON, por lo que caracteres como `|` no rompen las claves. Se rechazan rutas de prototipo y las búsquedas de claves tratan la puntuación como texto literal. Una línea final incompleta del WAL queda separada antes de aceptar nuevas escrituras.

Las escrituras y la compactación están serializadas. `clear()` permite seguir escribiendo; una escritura que falla en disco no reemplaza el estado visible. Un snapshot nuevo se escribe a un temporal y se renombra antes de truncar el WAL. Los errores de escritura/cierre se propagan; las escrituras de fondo del player también notifican el fallo mediante `debug`, y un llamador que use `await updateData()` recibe el rechazo.

Local es para **un proceso por archivo**, sin bloqueo distribuido ni garantía `fsync` frente a un corte eléctrico. Requester/userData deben poder serializarse a JSON para persistirlos en disco. No se guardan nuevas categorías de credenciales de voz en snapshots; los logs técnicos heredados siguen pudiendo contenerlas y requieren el control de acceso indicado en el README.

## Gateway de voz

VoicePacketHandler valida los dos tipos de evento y filtra guilds inexistentes, otros usuarios y datos malformados. Voice espera la combinación de estado y servidor; admite cualquiera de los dos órdenes, coordina una actualización REST en vuelo y envía después las credenciales más recientes. Un duplicado no crea solicitudes paralelas.

Los cambios de sesión/token, el endpoint nulo, desconectar y destruir invalidan las respuestas anteriores. La confirmación antigua no emite `connect`, no cambia el estado a conectado y no reinicia música detenida por el usuario. Destruir también libera los timers y los listeners internos que esperaban conexión. Una reconexión pedida desde un listener de desconexión espera a que termine la salida anterior.

Un token ya confirmado para una sesión no se reutiliza en un movimiento posterior. Los eventos del gateway no incluyen un identificador de intento que permita correlacionar arbitrariamente paquetes atrasados; si las nuevas credenciales ya se consumieron antes de un cambio posterior, se espera un nuevo evento de servidor. La confirmación REST significa que el servidor aceptó las credenciales, **no** que haya audio audible en Discord.

## Evidencia y límites

Las pruebas deterministas cubren cancelación de resolución, conservación de cola/posición/metadatos, snapshots nuevos y heredados, errores de disco, recuperación WAL, paquetes de voz en distinto orden, duplicados, respuestas tardías, reentrancia y limpieza de recursos. El laboratorio fijado por digest añade resolución de un WAV HTTP local Lavalink→NodeLink y NodeLink→Lavalink, sin voz ni credenciales de Discord.

Se siguen manteniendo pendientes audio audible, DAVE/gateway real, extensiones de audio habilitadas, pruebas sostenidas y preparación de una versión publicable. La [evidencia saneada](track-protocol-evidence.json) registra 16 casos de protocolo; el runner cuenta además tres grupos, para un total de 19 resultados. La evidencia del laboratorio se añade a `trackResolution` en el informe JSON del workflow. Repite las comprobaciones con `pnpm test`, `pnpm run test:types`, `pnpm run pack:check` y `pnpm run test:backends`.

Fuentes primarias: [carga de pistas Lavalink v4](https://lavalink.dev/api/rest#track-loading), [eventos de voz Discord](https://docs.discord.com/developers/topics/voice-connections#retrieving-voice-server-information), [WAL/snapshot con fs de Node 22](https://nodejs.org/docs/latest-v22.x/api/fs.html), [duración HTTP NodeLink en el commit fijado](https://github.com/PerformanC/NodeLink/blob/804e0d6d0f1af30384e0a2d12ddbc8d79e85cf35/src/sources/http.ts#L403).

## Verificación en GitHub

Revisión: [PR #4](https://github.com/melodiabl/NyxLink/pull/4), con base en la segunda entrega. El código en `95fb7cb` pasó [Node 22/24](https://github.com/melodiabl/NyxLink/actions/runs/41436825491), [laboratorio real y artefacto de evidencia](https://github.com/melodiabl/NyxLink/actions/runs/41436825313) y [CodeQL](https://github.com/melodiabl/NyxLink/actions/runs/41436825369). El informe remoto registra 19/19 resultados correctos, incluyendo los tres grupos de casos.

[Qodana](https://github.com/melodiabl/NyxLink/actions/runs/41436825303) no puede analizar sin `QODANA_TOKEN`, que no está configurado en los secretos del repositorio. Su check permanece visible. Esta limitación no se presenta como una comprobación superada.
