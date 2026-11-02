# Validación final y consolidación

[PR #6 hacia dev](https://github.com/melodiabl/NyxLink/pull/6) reúne las entregas 2–4 con la preparación privada final. Los PR anteriores ya fueron fusionados por el usuario en sus bases apiladas, dejando dev con la primera entrega. El PR consolidado no se fusiona automáticamente y no cambia la rama predeterminada.

## Implementación y distribución

- Identidad autorizada: nyxlink@0.1.0-dev.1, private=true y publicación automática bloqueada.
- 164 pruebas locales correctas, cero omitidas; regresiones nuevas de búsqueda/cache/requester, cancelación/timeout/429 HTTP reales y errores de streaming.
- Seis comprobaciones del [tarball instalado](package-evidence.json), con SHA-256: CJS, ESM, tipos NodeNext sin skipLibCheck, licencia y ejemplos JS/TS sin login.
- Typecheck, tipos públicos, lock congelado, allowlist del paquete y audit de producción correctos.
- 19 resultados del [runner real de protocolo y resolución bidireccional](validation-protocol-evidence.json) correctos; [extensiones NodeLink](extensions.md) habilitadas/deshabilitadas correctas con límites precisos.
- [Cobertura medida](quality.md), [API generada](api.md), [migración](migration.md), [búsqueda opcional](search.md) y [conciliación completa del backlog](../tasks/master-status.md).
- Banner idéntico al PNG enviado por el usuario; OSL-3.0 y créditos conservados.

## Resistencia de una hora

El [informe local de 3600 segundos](performance/endurance-3600.json) pasó en 3600.355 s: 3600 ciclos, 225 reanudaciones y 360 pings por backend. El cierre registró cero players/nodos/Timeouts; el worker salió con código 0 y sus dos contenedores se retiraron. El [análisis de memoria, CPU y latencias](stability.md#ejecución-local-de-una-hora) indica la revisión y condiciones medidas; no atribuye a esa hora cobertura de búsqueda nueva ni de audio Discord.

## GitHub

El código de b9cd517 pasó [validación Node 22/24](https://github.com/melodiabl/NyxLink/actions/runs/41519407282), [protocolo/extensiones](https://github.com/melodiabl/NyxLink/actions/runs/41519407272), [CodeQL](https://github.com/melodiabl/NyxLink/actions/runs/41519407247) y [benchmark/endurance smoke](https://github.com/melodiabl/NyxLink/actions/runs/41519407333). Los jobs de validación incluyen instalación del tarball y ejemplos en ambas versiones Node.

[Qodana](https://github.com/melodiabl/NyxLink/actions/runs/41519407478) falló porque QODANA_TOKEN está vacío; requiere el secreto QODANA_TOKEN_1916333486. No se cuenta como análisis superado.

## Límites y condiciones de release

La validación técnica local no certifica audio audible ni DAVE/gateway real. Mixer durante reproducción, letras encontradas/idiomas y extensiones de terceros requieren sus fixtures/proveedores. El WAV HTTP de NodeLink revela una limitación de la imagen fijada; el WAV local sí produce audio decodificado sin Discord. La revisión humana, integración en dev, token de Qodana y titularidad/autorización de publicación siguen pendientes según [release-readiness.md](release-readiness.md).
