# Búsqueda y caché opcionales

`manager.search({ query, source?, node?, requester?, signal? })` conserva el resultado `SearchResult`. Spotify/Deezer nativos se intentan primero, como antes. La configuración nueva vive en `options.search`:

```ts
const manager = new Manager({
  nodes,
  options: {
    database: { type: 'memory' },
    search: {
      defaultPlatform: 'youtube',
      timeoutMs: 10000,
      fallbackPlatforms: ['soundcloud'],
      cache: { ttlMs: 30000, maxEntries: 100 }
    }
  }
});
const result = await manager.search({ query: 'artista canción', requester, signal: AbortSignal.timeout(15000) });
```

Sin configuración no hay caché ni fallback. Cada petición REST tiene un timeout de 10 segundos por defecto, configurable entre 1 y 120000 ms. El signal limita la operación completa, también entre intentos. Los resolvers nativos/personalizados deben cooperar con el signal para cancelar su propio tráfico; NyxLink descarta su respuesta y consume rechazos tardíos aunque no cooperen.

El fallback se aplica a búsquedas realizadas por el backend. Los resultados de Spotify/Deezer nativos, incluidos empty/error, conservan su contrato y se devuelven antes de esa política. Se permiten hasta tres plataformas alternativas distintas después de la principal. Solo se cambia de fuente si el resultado está vacío o contiene un error de carga; errores HTTP, incluido 429, se propagan sin reintento automático. Una URL HTTP/HTTPS se envía intacta, sin prefijos ni fallback de texto. Las capacidades específicas de NodeLink se comprueban antes de usarlas. `sources.disabledSources` filtra los resultados, incluidos los nativos.

La caché LRU es de memoria y pertenece al manager: TTL máximo de una hora y capacidad entre 1 y 1000 entradas. Las claves distinguen nodo, sesión, backend, versión, consulta y plataformas. Se clonan las respuestas y se asigna el requester al devolverlas; el requester de una petición no pasa a la siguiente. El cierre borra la caché y cancela búsquedas pendientes. No habilites caché para consultas sensibles: consultas y metadatos permanecen temporalmente en la memoria del proceso.

Un `resolver: async (query, node) => IRESTLoadTracks | null` puede aportar un resultado compatible con v4; `null` continúa con el backend. Sus resultados y los de fuentes nativas no se cachean, ya que pueden depender de identidad o permisos. No hay retry, cacheo persistente, infraestructura Redis ni métricas de audio implícitos.
