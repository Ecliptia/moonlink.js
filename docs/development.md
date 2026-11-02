# Baseline de NyxLink

Fecha: 2026-11-02. Base de implementación: `dev` en `f6631bb289aee180af48cb4f0f1671e5e075249c` (Moonlink 5.3.0-dev.2). El banner aprobado de `v5.2` se conservó mediante un commit independiente; no se mezclaron las dos ramas completas.

## Entorno y evidencia inicial

- Node.js 22.23.2, npm 10.9.8, pnpm 10.34.5, TypeScript 5.9.3.
- `pnpm install --frozen-lockfile`: correcto usando el lock de dev, sin actualización masiva de dependencias.
- `pnpm exec tsc --noEmit` y `pnpm run build`: correctos antes de los cambios de comportamiento.
- No existía una suite automática: `test` iniciaba el bot manual. Ahora está separado como `test:bot`.
- Nueve regresiones de autoplay escritas contra la base: siete fallaron y dos pasaron. Se reprodujeron stop/disable/re-enable/destroy/reproducción explícita, mutación temporal de current y éxito falso.
- El árbol generado heredado tenía tres archivos desactualizados respecto al fuente; el build los regenera.

## Contrato y distribución

`tests/fixtures/public-exports.json` congela los exports originales. `tests/types/public-api.ts` comprueba el consumo TypeScript y las firmas existentes de play, stop, setVolume y transferNode. Las incorporaciones nuevas deben ser aditivas.

El lock oficial es `pnpm-lock.yaml`; `packageManager` fija pnpm 10.34.5. CI instala con `--frozen-lockfile` y valida Node 22/24. En la primera entrega se marcó el paquete `private` hasta elegir identidad y versión final; ambos workflows de publicación heredados se sustituyeron por validación sin publicación. No se publica npm desde este trabajo.

`pack:check` inspecciona el tarball previsto: solamente dist, README, LICENSE, package.json y el banner aprobado. El bot manual, pruebas, configuración y datos locales quedan fuera.

## Compatibilidad pendiente en la primera entrega

| Área | Evidencia disponible | Pendiente |
| --- | --- | --- |
| API CJS y tipos | Smoke de import y fixture TS local | Consumidor real y empaquetado de prerelease |
| Estado del player | Pruebas deterministas con clases reales y REST/search controlados | Audio y gateway real de Discord |
| Lavalink v4 | Protocolo heredado | Versión concreta, reproducción, errores y reconexión |
| NodeLink | Protocolo y extras heredados | Versión concreta, capacidades, mixer, letras y recepción |
| Node 24 | Incluido en matriz CI | Resultado remoto de los checks |

Las plantillas del ZIP no son código operativo y no se copiaron sobre el fork. El [plan](../tasks/plan.md) conserva el orden de la migración y los pendientes.

## Primera implementación

La suite cubre búsquedas demoradas y fuera de orden, stop/desactivación/destroy, reproducción explícita nueva, eventos de pista antiguos/duplicados, comandos REST demorados, timeout de resume, handshake de voz, respuestas vacías, fallos de restauración, transferencia parcial y recuperación cancelada. El error HTTP 404 se reproduce con un servidor local real. El logger se verifica en procesos separados para comprobar silencio, niveles, banner, estado, failover y retirada de listeners.

El diagnóstico inicial de siete fallos de autoplay se convirtió en regresiones verdes. La revisión adicional encontró y corrigió el bloqueo de voz al serializar, la confusión entre cancelación y fallo de recuperación, y el catch de 404 inalcanzable porque el transporte heredado absorbía el error. La nueva opción de propagación se limita al PATCH de player para preservar los demás contratos HTTP heredados.

Los resultados locales definitivos y el resultado de CI se registran en la PR. Las pruebas usan clases reales con REST/search controlados, además del servidor HTTP local; no sustituyen las pruebas reales de Discord/Lavalink/NodeLink.

## Resultado local de la entrega

- 54 pruebas automáticas: 54 correctas, cero fallidas/omitidas, en Node 22.23.2.
- Build TypeScript, typecheck y consumidor TS: correctos.
- Instalación con pnpm 10.34.5 y lock congelado: correcta.
- Paquete previsto: 112 archivos, inspección correcta; sin publicación.
- Auditoría de dependencias de producción: sin vulnerabilidades conocidas al ejecutar la comprobación.
- Cambios enviados a [PR #1](https://github.com/melodiabl/NyxLink/pull/1), en borrador contra dev. El resultado de Node 24 depende del check remoto.

## Estado consolidado posterior

Los resultados anteriores registran cada entrega en su fecha. El usuario fusionó los PR #1/#3/#4/#5 en sus bases; la validación final se revisa contra dev para consolidar todas las entregas. La identidad actual es nyxlink@0.1.0-dev.1, privada. Consulta [estado del plan](../tasks/master-status.md), [preparación de release](release-readiness.md), [API](api.md) y [ejemplos](../examples/README.md) para la situación vigente.
