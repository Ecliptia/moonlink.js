# Migración desde Moonlink

NyxLink parte de Moonlink dev `5.3.0-dev.2`. Su primera identidad propia es `nyxlink@0.1.0-dev.1`, todavía privada. Esta versión no continúa la numeración de releases de Moonlink ni indica una release estable.

## Instalar para una prueba local

```sh
pnpm install --frozen-lockfile
pnpm run build
npm pack --ignore-scripts
# En el directorio del bot:
pnpm add /ruta/NyxLink/nyxlink-0.1.0-dev.1.tgz
```

Cambia `require('moonlink.js')` por `require('nyxlink')`, o el mismo specifier en tus imports TypeScript/ESM. El artefacto conserva CommonJS y permite imports nombrados en ESM; los consumidores de tipos CJS/ESM se verifican con NodeNext sin skipLibCheck. No hay una publicación npm anunciada. Requiere Node 22.12+; CI verifica Node 22 y 24. Discord.js pertenece al bot, no es una dependencia runtime de NyxLink.

## Cambios de comportamiento relevantes

- `stop`, desactivar autoplay, destruir o reproducir explícitamente invalidan recomendaciones antiguas. Las órdenes del player se serializan; comprueba el booleano de `play()` y `transferNode()` antes de anunciar éxito.
- `setVolume()` sigue siendo encadenable. Usa `await player.setVolumeAsync(value)` cuando necesites detectar rechazo del backend.
- `await manager.shutdown()` espera cierre de players/nodos, almacenamiento y listeners de conectores. Es idempotente y rechaza trabajo nuevo. El manager no destruye el cliente Discord externo.
- Las extensiones de NodeLink exigen capacidades observadas. Maneja `FeatureUnavailableError` y los errores HTTP conservando status/body; un plugin no instalado no se anuncia como disponible.
- Las pistas cambian de codificación al resolverlas en el backend destino cuando hace falta; se conservan metadatos/requester. No reutilices un encoded entre backends como si fuera portable.
- El almacenamiento Local sigue leyendo snapshots antiguos. Haz copia antes de migrar y usa un solo proceso por directorio; `flush()` no promete durabilidad ante corte eléctrico. Para volver a un proveedor anterior a la tercera entrega, restaura una copia anterior del snapshot/WAL.
- El logger permanece opcional y silencioso por defecto. Los eventos debug heredados conservan texto técnico crudo: controla acceso a credenciales y tokens. Algunos prefijos históricos Moonlink se conservan para compatibilidad.
- Caché, fallback de búsqueda y resolver son opt-in; ver [búsqueda](search.md).

## Comprobar tu bot

Los [ejemplos JS/TS](../examples/README.md) se importan/compilan contra el paquete instalado sin iniciar sesión. Después de revisar la configuración de un bot de pruebas dedicado, verifica permisos, joins/movimientos, stop/autoplay, reconexión, audio y DAVE en tus versiones exactas de backend. La evidencia local de este repositorio no certifica esos recorridos Discord.
