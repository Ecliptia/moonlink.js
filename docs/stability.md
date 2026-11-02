# Cuarta entrega: cierre y estabilidad medidos

La rama `feat/nyxlink-stability` amplía la tercera entrega. No conecta bots de Discord, no cambia el nombre/versión npm y no publica paquetes.

## Cierre del cliente

`await manager.shutdown()` es una operación terminal e idempotente. Marca el manager como cerrado, detiene el monitor de inactividad, espera una inicialización pendiente y destruye players antes de cerrar nodos y almacenamiento. Libera los listeners que instalaron el logger y el conector; conserva los listeners que pertenecen a la aplicación. Una segunda llamada espera el mismo cierre. Para iniciar otro cliente se crea un Manager nuevo.

```ts
const manager = new Manager(config);
await manager.init(clientId);
// Al terminar el trabajo de la aplicación:
await manager.shutdown();
```

El manager cerrado rechaza `init`, `use`, búsquedas y creación de players/nodos. Un fallo durante el cierre se informa con AggregateError después de intentar liberar el resto de recursos. Un proveedor de almacenamiento se cierra incluso si falla su flush. Si falla la inicialización, se cierran los nodos y el almacenamiento parciales antes de permitir un reintento.

Los conectores propios pueden implementar `dispose(): void | Promise<void>` para liberar recursos. El conector DiscordJs incluido retira sus callbacks de `raw` y `clientReady`, sin cerrar ni hacer logout del cliente Discord de la aplicación. Destruir un player espera su limpieza en curso y elimina su snapshot después de las escrituras anteriores; así no queda un registro por cada guild que ya terminó.

Los pings WS se correlacionan con el payload que devuelve el pong. Dos pings simultáneos no se resuelven por la misma respuesta; los pings predeterminados tienen identificadores distintos. Se rechazan payloads de más de 125 bytes o un payload idéntico que ya esté pendiente. Cerrar el socket cancela los deadlines, rechaza los pings pendientes y libera buffers, incluso si falla la escritura del frame de cierre.

## Medición de colas

Comando: `pnpm run bench`. Es una prueba sintética de persistencia en memoria, sin red ni audio, con cinco muestras alternadas por modo y 500 pistas. Se fuerza GC antes de medir. Los números describen este host/Node, no una garantía para bots en producción.

| Medida (mediana de 5) | Base `1152f1e` | Después del cierre corregido |
| --- | ---: | ---: |
| 500 llamadas individuales, tiempo total | 108.305 ms | 104.836 ms |
| Una llamada con 500 pistas, tiempo total | 0.854 ms | 0.934 ms |
| Heap asignado al añadir individualmente | 29,194,032 bytes | 29,186,192 bytes |
| Heap asignado al añadir el lote | 211,584 bytes | 211,584 bytes |
| Claves retenidas del player después de destruirlo | 4 | 0 |

No se atribuye una mejora de latencia al cambio de cierre: la diferencia temporal entre revisiones está dentro de la variación observada. La corrección comprobada es la eliminación de registros retenidos. Para cargar una playlist completa, usa la API por lotes existente `player.queue.add(tracks)`: cada mutación individual persiste un snapshot de la cola, de modo que repetirla hace más trabajo y asigna más memoria.

[Datos de la base](performance/queue-before.json) y [datos posteriores](performance/queue-after.json) contienen las muestras, CPU/Node y tiempos reales. El `passed: false` del informe anterior registra el defecto conocido de retención; el informe actual exige cero claves del player destruido. No hay un umbral de milisegundos arbitrario en CI.

## Endurance con servidores reales

```sh
pnpm run test:endurance -- 600
# Docker, usado en GitHub:
NYXLINK_CONTAINER_ENGINE=docker pnpm run test:endurance -- 600
# Una hora, con evidencia local registrada:
pnpm run test:endurance -- 3600
```

El runner acepta entre 10 y 7200 segundos. Reutiliza las imágenes fijadas por digest y los límites de una CPU/768 MiB por servidor. NodeLink se ejecuta con raíz de solo lectura y npm offline para impedir que su actualizador de arranque sustituya dependencias dentro de la imagen fijada. El código de los backends no se parchea.

Cada segundo se crea un player REST pausado, se añade una cola local de 16 pistas, se actualiza volumen, se ejecuta stop y se destruye. Se comprueba que no queden players ni snapshots. Cada diez ciclos se carga y decodifica el WAV local, se consulta stats y se mide ping. Cada quince segundos se fuerza una pérdida TCP y se exige un `ready` que confirme resume con la misma sesión. No se envían credenciales de voz ni se inicia una pista en Discord.

El informe separa el proceso cliente de las estadísticas de los servidores: heap después de GC, RSS, CPU agregada del worker (incluye arranque/cierre), event-loop delay y percentiles de operaciones. RSS puede incluir asignaciones nativas/fragmentación; diez minutos no demuestran estabilidad durante horas. Se exige ausencia de errores, reanudaciones confirmadas, ciclos completados y cierre de players/nodos/timers; los recursos de proceso restantes se informan por tipo. El runner tiene watchdog de duración más 90 segundos, para que una operación bloqueada no mantenga el laboratorio indefinidamente.

La [ejecución local de 600 segundos](performance/endurance-600.json) terminó correctamente en 600.998 s:

| Resultado | Lavalink | NodeLink |
| --- | ---: | ---: |
| Ciclos de player completados | 601 | 601 |
| Resume confirmado tras pérdida TCP | 37 | 37 |
| Pings manuales confirmados | 61 | 61 |
| PATCH p95 | 9.706 ms | 14.600 ms |
| Resume p95 | 35.608 ms | 36.183 ms |

El cliente pasó de 6,718,392 a 8,175,488 bytes de heap después de GC; la muestra posterior a 60 s era 7,539,256 bytes. El RSS inicial/final fue 67,006,464/79,241,216 bytes. Estos valores muestran el cambio observado y no prueban ausencia de crecimiento a largo plazo. El event-loop delay p95 fue 11.182 ms y el máximo 279.183 ms, con resolución de muestreo de 10 ms y GC explícito durante la prueba.

El cierre registró cero players/nodos y ningún Timeout activo. La captura inmediata todavía enumera dos TCPSocketWrap; después el worker terminó normalmente y los dos contenedores fueron retirados. No se presenta esa captura como cero recursos de todo el proceso. GitHub ejecuta un smoke de 60 segundos y permite elegir otra duración mediante workflow_dispatch. Los informes se guardan como artefactos, sin contraseñas ni IDs de sesión/guild.

## Lo que sigue pendiente

Estos tests no certifican audio audible, DAVE, gateway real, letras/mixer/recepción de voz ni latencia play→trackStart. Tampoco sustituyen una prueba de más de una hora en la infraestructura de destino. La preparación de publicación se detalla en [release-readiness.md](release-readiness.md).

Fuentes: [recursos activos de Node](https://nodejs.org/docs/latest-v22.x/api/process.html#processgetactiveresourcesinfo), [memoria del proceso](https://nodejs.org/docs/latest-v22.x/api/process.html#processmemoryusage), [event-loop delay](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions), [Ping/Pong RFC6455](https://www.rfc-editor.org/rfc/rfc6455#section-5.5.2), [resume Lavalink](https://lavalink.dev/api/rest#update-session).

## Verificación en GitHub

[PR #5](https://github.com/melodiabl/NyxLink/pull/5), basado en la tercera entrega. El código en `8a772ee` pasó [Node 22/24](https://github.com/melodiabl/NyxLink/actions/runs/41512283255), [protocolo y resolución cruzada](https://github.com/melodiabl/NyxLink/actions/runs/41512283284), [CodeQL](https://github.com/melodiabl/NyxLink/actions/runs/41512283165) y [benchmark/endurance CI](https://github.com/melodiabl/NyxLink/actions/runs/41512283143). El smoke remoto duró aproximadamente 61 s y completó 60 ciclos y tres reanudaciones por backend; el informe quedó como artefacto.

[Qodana](https://github.com/melodiabl/NyxLink/actions/runs/41512283226) vuelve a fallar por la ausencia del secreto entregado como QODANA_TOKEN. Ese análisis sigue pendiente; no se retira su check.

## Ejecución local de una hora

El [informe de 3600 segundos](performance/endurance-3600.json) terminó con passed=true en 3600.355 s. La prueba usa el runtime de la cuarta entrega (a40a138, mismo árbol funcional de cierre en 8e74b49), cargado antes del cambio de identidad y de la búsqueda opcional. Estos últimos cambios se verifican mediante las pruebas nuevas y el smoke CI del código final; no se atribuye a la prueba de una hora cobertura de búsqueda/caché.

La carga y los límites del runner permanecieron iguales a los de diez minutos. Durante la hora también se ejecutaron compilaciones y laboratorios auxiliares en el mismo host; no fue un entorno aislado para prometer latencias.

| Resultado | Lavalink | NodeLink |
| --- | ---: | ---: |
| Ciclos de player | 3600 | 3600 |
| Resumes confirmados | 225 | 225 |
| Pings manuales confirmados | 360 | 360 |
| PATCH p95 (ms) | 9.382 | 17.410 |
| Resume p95 (ms) | 43.773 | 46.236 |

| Muestra cliente | Heap tras GC (MiB) | RSS (MiB) |
| --- | ---: | ---: |
| Inicio | 6.409 | 63.223 |
| Después de 60 s | 7.204 | 69.047 |
| Después de 1800 s | 7.895 | 78.379 |
| Final | 8.042 | 79.113 |

El heap creció 0.838 MiB desde la muestra posterior a 60 s. El runner retiene muestras y tiempos de operaciones hasta escribir el informe; estos datos y el calentamiento forman parte de la memoria observada. No se deduce ausencia de fugas ni estabilidad de producción a partir de esta sola ejecución. Event-loop delay p95: 11.272 ms; máximo: 277.348 ms (muestreo de 10 ms y GC explícito).

El cierre registró cero players/nodos y ningún Timeout activo. La captura inmediata de recursos fue ["TCPSocketWrap","TCPSocketWrap"]; el worker terminó normalmente y los contenedores propios se retiraron después. La evidencia sigue limitada a protocolo/REST sin audio Discord.

### Recursos de los servidores

| Backend | Memoria a partir de 60 s (MiB) | Memoria final (MiB) | Máximo observado (MiB) | systemLoad final (valor bruto) |
| --- | ---: | ---: | ---: | ---: |
| lavalink | 32.797 | 31.975 | 45.250 | 0.09985428987743207 |
| nodelink | 22.253 | 19.836 | 25.991 | 0.94 |

Estos campos son los que informa cada servidor: no se fuerza GC en JVM/NodeLink ni se normaliza systemLoad entre sus implementaciones. La memoria oscila con la asignación y el recolector de cada runtime. CPU agregada del worker cliente: 131.676 s de usuario y 24.069 s de sistema durante la ejecución y cierre; no es CPU de los contenedores.
