# Reproducción y recuperación

Los comandos de cada player se ejecutan en orden. `play`, `stop`, `pause`, `resume`, `seek`, `setVolumeAsync`, las actualizaciones públicas y la destrucción no se adelantan a una petición REST pendiente del mismo player. Los players de distintos guilds mantienen colas independientes.

Una orden nueva de reproducción, stop o destroy invalida el trabajo automático anterior. Desactivar autoplay cancela las recomendaciones pendientes, pero no cancela un play explícito. Las búsquedas reciben la pista semilla sin reemplazar temporalmente `player.current`.

`play()` devuelve `false` si se cancela, no encuentra una pista válida o el backend rechaza/no confirma la actualización. Una respuesta REST aceptada confirma la petición; la reproducción audible se debe comprobar con eventos y pruebas reales de audio. `autoPlayed` se emite después de la confirmación. Una respuesta antigua no puede reemplazar una pista nueva ni vaciar su estado al finalizar una búsqueda cancelada.

## Volumen

```js
// Conserva el retorno encadenado y actualiza el volumen deseado de forma inmediata.
manager.on('playerVolumeError', (player, error, requestedVolume) => {
  // Decide aquí cómo informar/reintentar según tu aplicación.
});
player.setVolume(80).setAutoPlay(true);

// Espera la respuesta del backend; si falla, conserva el último valor local.
try {
  await player.setVolumeAsync(80);
} catch (error) {
  // La petición no fue confirmada.
}
```

## Recuperación

`transferNode(nodeOrIdentifier)` verifica el resultado de `restart()`. Solo emite `playerSwitchedNode` cuando la restauración termina correctamente. `playerNodeFailover` informa `in-progress`, `recovered`, `failed` o `cancelled`. Al cambiar de nodo se descarta la confirmación de sincronización del nodo anterior, conservando pista, posición, volumen, pausa y cola en una transferencia válida.

Una recuperación cancelada por una orden del usuario no debe destruir ni restaurar sobre la reproducción nueva. Si falla la transferencia después de borrar el player remoto anterior, no se promete rollback al servidor anterior: se conserva el resultado fallido para que la aplicación decida cómo continuar.

Los PATCH de player propagan los errores HTTP y no se reintentan automáticamente. Un 404 inicia recuperación fuera del comando fallido para que esta no espere una cola que ella misma bloquea. La suite verifica el 404 con un servidor HTTP local; todavía no certifica renovación de sesiones contra servidores reales.

## Voz y timeout

La confirmación de credenciales de voz usa `updateVoice()` fuera de la cola de reproducción, porque `play()` puede estar esperando precisamente esa confirmación. No cambia el backend de audio ni incorpora Native Voice.

El timeout de `resume({ timeout })` limita la espera del llamador. La petición pendiente sigue ocupando su turno hasta terminar; una orden posterior no la adelanta. Los timeouts y la recuperación real de los transportes todavía requieren la matriz de integración de Lavalink/NodeLink.
