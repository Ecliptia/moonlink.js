# Logger Consola Combinado

Consola 3.4.2 (MIT) actúa como motor del logger aportado en el paquete maestro. NyxLink conserva el formateador, el reporter y el banner ASCII propios. No se añadieron otros motores de logs ni dependencias para dibujar el banner.

El modo predeterminado es silencioso. Importar NyxLink o crear un Manager sin `options.logging` no añade salida a la consola.

```js
const { Manager, Logger } = require('./dist'); // Desde el checkout de desarrollo.

const manager = new Manager({
  nodes: [{
    identifier: 'audio',
    host: process.env.AUDIO_HOST,
    port: Number(process.env.AUDIO_PORT),
    password: process.env.AUDIO_PASSWORD,
    secure: process.env.AUDIO_TLS === 'true',
  }],
  options: {
    logging: { level: 'debug', color: true, banner: true },
  },
});

// Después de conectar nodos reales:
manager.logger.managerStatus(manager);
manager.detachLogger(); // Retira los listeners del logger; conserva los del bot.

// Alternativa: conectar un logger ya configurado a un Manager existente.
const logger = new Logger({ level: 'info', timestamps: true });
const detach = logger.attachManager(manager);
logger.banner();
detach();
```

Los niveles son `silent`, `error`, `warn`, `info`, `debug` y `trace`. El banner requiere activación voluntaria y nivel `info` o superior. Las líneas heredadas se enrutan por módulo sin volver a emitir el evento debug; se evita así la recursión.

`SYSTEM STATUS` usa nodos inicializados, su estado observado, latencia WebSocket disponible y players locales. Una latencia desconocida aparece como `--`; un backend aún no identificado aparece como `Unknown`. No se inventan valores de carga, latencia ni reproducción. Los eventos de estado actualizan el panel.

`NODE FAILOVER` consume el resultado de la transferencia del player. `Recovered` se muestra únicamente cuando la recuperación ha sido confirmada. La API manual `logger.systemStatus()`/`logger.failover()` sigue disponible; sus datos son responsabilidad de quien la invoque.

Los eventos `debug` se conservan íntegros, según la decisión vigente del paquete maestro. Pueden incluir credenciales y tokens. El responsable del bot administra el acceso a la terminal y sus archivos y evita reenviarlos sin control a navegadores, Discord o servicios externos. No adjuntes también `manager.on('debug', console.log)` si quieres una única salida.
