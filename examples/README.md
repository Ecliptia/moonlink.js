# Ejemplos Discord.js

`discordjs.cjs` y `discordjs.ts` exponen la misma fábrica y operación de búsqueda/cola. Se compilan/importan contra el tarball instalado durante `pnpm run test:package`, sin iniciar sesión ni contactar Discord. Discord.js es una dependencia del bot; no se añade al runtime de NyxLink.

1. Instala el tarball privado de NyxLink y Discord.js 14 en tu bot.
2. Llama a `createMusicClient([{ host, port, password, secure }])` con configuración propia. Registra tus manejadores `nodeError` y `trackException`; no reenvíes debug crudo a Discord.
3. La aplicación llama explícitamente a `client.login(token)`. Espera `nodeReady` antes de usar `queueTrack` desde un manejador que haya verificado permisos y canal de voz del usuario.
4. Serializa las órdenes de cada guild en el bot. `queueTrack` es una operación individual; no coordina dos comandos entrantes simultáneos.
5. Al salir ejecuta `await close()`. La biblioteca cierra sus recursos; la fábrica también destruye el cliente que creó.

La función devuelve `false` si no encuentra pistas o el backend rechaza la reproducción. Un resultado positivo refleja la aceptación del backend, no prueba audio audible. El bot debe controlar permisos, límites de cola y selección de resultados/playlist según su producto.
