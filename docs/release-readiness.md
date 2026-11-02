# Preparación de prerelease

Identidad autorizada: **nyxlink@0.1.0-dev.1**. Se conserva `private: true` y el workflow de publicación bloqueado. Los PR #1/#3/#4/#5 fueron fusionados por el usuario en sus bases apiladas; la entrega final consolida el resultado mediante un PR a dev. No se anuncia una release npm.

## Evidencia disponible

- Build, lock congelado, pruebas sin bot, tipos públicos y allowlist del tarball.
- Instalación real del tarball: CommonJS, imports nombrados ESM, consumidores TypeScript NodeNext sin skipLibCheck y ejemplos Discord.js JS/TS sin login.
- Regresiones de reproducción/autoplay, selección/failover, resolución entre backends, almacenamiento, gateway simulado, búsqueda/caché y cancelación HTTP.
- Protocolo local con Lavalink 4.2.2 y NodeLink 3.10.0-dev.2026-10-20.1 fijados por digest; [extensiones locales](extensions.md).
- Benchmark y endurance con métricas y limpieza: [estabilidad](stability.md) registra las duraciones terminadas.
- [API](api.md), [migración](migration.md), [ejemplos](../examples/README.md), [conciliación del plan](../tasks/master-status.md), banner y OSL-3.0 conservados.

## Condiciones externas pendientes

1. Bot/canal dedicados para audio, permisos, movimientos, reconexión, DAVE y latencia play→trackStart. El usuario confirmó que no existe bot de pruebas disponible.
2. Proveedores y pistas adecuados para letras encontradas/idiomas, capítulos reales, mixer durante reproducción y extensiones opt-in que se vayan a anunciar. La imagen NodeLink fijada además falla al decodificar el WAV HTTP de prueba; no se oculta ese límite.
3. Revisión humana del PR consolidado e integración en dev. CI verde no sustituye audio real. La rama predeterminada del repositorio sigue bajo decisión del propietario.
4. Secreto `QODANA_TOKEN_1916333486` para el workflow Qodana, que lo entrega como QODANA_TOKEN. Su análisis no se declara superado ni se desactiva para ocultar la ausencia.
5. Confirmar control/titularidad del nombre npm, responsables de release y autorización explícita antes de retirar private/publicar. El nombre elegido no equivale a una reserva en npm.
6. Dimensionar carga/audio y endurance en infraestructura de destino; el laboratorio local no promete SLA ni ausencia de fugas bajo cualquier carga.

## Reproducir antes de distribuir

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run test:types
pnpm run test:package
pnpm run docs:api
pnpm run pack:check
pnpm audit --prod --audit-level=high
pnpm run test:backends
pnpm run test:extensions
pnpm run bench
pnpm run test:endurance -- 3600
```

Los runners de servidores requieren Linux/Podman o Docker. `pack:check` y `test:package` no publican. Los ejemplos se verifican sin token ni conexiones Discord.

## Reversión

Conserva checkout/tarball y copia de datos anteriores. Cierra el manager antes de sustituir la biblioteca. Se siguen leyendo snapshots/WAL antiguos; para volver a Local anterior a la tercera entrega, restaura una copia previa del almacenamiento, ya que su lector no interpreta el WAL JSON nuevo. No hay cambios de datos, despliegues ni publicaciones remotas automáticas.
