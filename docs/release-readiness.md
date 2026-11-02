# Preparación de prerelease

Esta documentación prepara una revisión; **no autoriza ni ejecuta una publicación**. El paquete sigue con `private: true`, nombre heredado `moonlink.js` y versión `5.3.0-dev.2`. La identidad final y la primera versión NyxLink requieren una decisión separada. Los PR de las entregas permanecen en borrador y no se fusionan automáticamente.

## Evidencia disponible

- Compilación TypeScript, consumidor público, instalación con lockfile congelado y allowlist del paquete.
- Regresiones de reproducción/autoplay, selección/failover, resolución entre backends, snapshots/almacenamiento y gateway simulado.
- Protocolo local con Lavalink 4.2.2 y NodeLink 3.10.0-dev.2026-10-20.1, fijados por digest.
- Benchmark reproducible y cierre de recursos; ver [stability.md](stability.md) para duración, condiciones y límites del endurance.
- Conservación del banner, créditos y licencia OSL-3.0 del fork.

## Condiciones aún abiertas

1. Decidir nombre npm, versión de prerelease, responsables y guía de migración final. Revisar el contenido del tarball antes de retirar el bloqueo de publicación.
2. Revisar y aprobar las entregas apiladas antes de integrarlas. Una CI correcta no equivale a una revisión humana ni a compatibilidad de audio certificada.
3. Proporcionar un bot/canal dedicados y validar audio, permisos, movimientos, reconexiones y DAVE con las versiones concretas de backend. No utilizar bots de producción para suplir esa configuración.
4. Probar explícitamente las extensiones habilitadas que se vayan a anunciar y la compatibilidad de plugins/codificaciones del mismo backend.
5. Ejecutar endurance de una hora o más y medir el tráfico esperado en la infraestructura de destino. Registrar latencias, memoria, errores y condiciones, sin extrapolar el smoke de CI.
6. Configurar el secreto `QODANA_TOKEN_1916333486` si se exige ese análisis: el workflow lo entrega como variable `QODANA_TOKEN` y actualmente está ausente. No se considera superado ni se desactiva para ocultar el fallo.

## Verificación antes de distribuir

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run test:types
pnpm run pack:check
pnpm audit --prod --audit-level=high
pnpm run test:backends
pnpm run bench
pnpm run test:endurance -- 3600
```

`pack:check` inspecciona el paquete y no lo publica. Los comandos locales de protocolo y endurance requieren Linux y Podman/Docker; no sustituyen la validación de Discord descrita arriba.

## Reversión

Mientras las entregas estén sin fusionar, cada rama permite revisar el cambio frente a su base sin modificar `dev`. Para una prueba local, conserva el checkout/tarball anterior y el directorio de datos; cierra el manager antes de cambiar la biblioteca. Los snapshots y WAL antiguos siguen siendo legibles por la nueva versión. El WAL JSON nuevo no debe abrirse con un proveedor Local anterior a la tercera entrega: usa una copia de los datos previa a la prueba para volver atrás. No hay migraciones de datos ni publicaciones remotas automáticas en este bloque.
