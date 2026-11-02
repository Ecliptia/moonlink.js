<img src="assets/nyxlink_banner.png" alt="NyxLink — A modern Lavalink &amp; NodeLink client for Discord bots" width="100%">

# NyxLink

Cliente de audio para bots de Discord derivado de [Moonlink.js](https://github.com/Ecliptia/moonlink.js). El desarrollo parte de Moonlink `dev` 5.3.0-dev.2 y conserva su API pública cuando es posible.

Los backends objetivo son **Lavalink v4 y NodeLink**. La validación de audio real, reconexión y compatibilidad por versión sigue pendiente; consulta el [estado de desarrollo](docs/development.md) y el [plan de trabajo](tasks/todo.md).

## Desarrollo

Requiere Node.js 22.12+ o 24 y pnpm 10.34.5.

```sh
git clone --branch feat/nyxlink-foundation https://github.com/melodiabl/NyxLink.git
cd NyxLink
corepack pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run test:types
pnpm run pack:check
```

`pnpm test` compila y ejecuta pruebas automáticas sin tokens ni conexiones a Discord. `pnpm run test:bot` ejecuta el bot manual y requiere su propia configuración de pruebas.

## Estado de distribución

Esta rama es de desarrollo y la publicación está desactivada. El nombre npm heredado `moonlink.js` permanece como metadato histórico hasta elegir la identidad final de distribución; no identifica un paquete NyxLink publicado. No uses las estadísticas, versiones o instrucciones npm de Moonlink como si fueran de NyxLink.

## Logs

Los eventos `debug` heredados siguen disponibles. Sus mensajes técnicos pueden incluir contraseñas de nodos y tokens de voz: el responsable del bot controla el acceso a la consola y a sus archivos. No se deben reenviar automáticamente a navegadores, canales de Discord ni servicios externos.

El [logger Consola Combinado](docs/logging.md) es opcional: incluye banner ASCII y paneles de estado/failover con información real. Consulta también los [cambios de reproducción, recuperación y volumen](docs/playback.md) y el [changelog](CHANGELOG.md).

## Licencia y origen

Derivado de Moonlink.js, de **1Lucas1.apk y sus colaboradores**. Se conservan los avisos originales y la licencia [Open Software License 3.0](LICENSE). Los cambios de NyxLink no implican respaldo del proyecto original.
