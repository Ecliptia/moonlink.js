# Extensiones NodeLink: evidencia local

`pnpm run test:extensions` ejecuta perfiles habilitado/deshabilitado con la misma imagen NodeLink fijada por digest que el laboratorio base. Genera un WAV de un segundo, usa HTTP/archivo local y no contacta Discord ni proveedores externos. El backend no se parchea.

[Informe](extensions-evidence.json): ambos perfiles terminaron correctamente. “Passed” significa que las condiciones listadas se cumplieron, incluido el error conocido que se esperaba observar; no significa soporte universal de audio.

| Función | Resultado observado |
| --- | --- |
| Auth | Credencial incorrecta rechazada en el endpoint de stream. |
| trackstream | URL HTTP resuelta correctamente con ruta habilitada; estado disponible registrado. |
| loadstream local | WAV generado desde `/fixtures/tone.wav`; cabeceras RIFF/WAVE y bytes de audio comprobados, consumo limitado a 2 MiB. No hay salida Discord. |
| loadstream HTTP | La imagen `3.10.0-dev.2026-10-20.1` devuelve HTTP 500 “Unsupported audio format: undefined” para el WAV servido por el laboratorio. El cliente conserva status/body; no se declara esta combinación compatible. |
| Mixer | Listado, rechazo al añadir sin reproducción activa y 404 de capa inexistente. El ciclo de capas durante reproducción no puede validarse con un player pausado sin voz. |
| Letras/capítulos | Letras `empty` con proveedores deshabilitados y capítulos vacíos para la pista HTTP. No se acredita “found”, idiomas ni sincronización. |
| Rutas deshabilitadas | trackstream, loadstream y mix rechazan con `FeatureUnavailableError`; se actualiza su disponibilidad sin confundir una capa/player inexistente con endpoint ausente. |
| Limpieza | Se destruye el player REST y se comprueba listado vacío; cierre del manager y retirada de los contenedores propios. |

Las pruebas unitarias adicionales verifican descompresión de cuerpos de error y límite de 32 KiB para errores de streaming. El flujo de éxito permanece en streaming y acepta AbortSignal/timeout. La prueba de mixer no acredita límite de capas ni mezcla audible; eso requiere reproducción activa. Las extensiones de Lavalink dependen de plugins explícitos y se manejan como capacidades opcionales, no como endpoints estándar.
