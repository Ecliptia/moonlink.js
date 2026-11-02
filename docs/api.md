# API pública

Generada desde las declaraciones de nyxlink@0.1.0-dev.1 con `pnpm run docs:api`.

Las firmas son la referencia de tipos; las condiciones y límites están en [migración](migration.md), [búsqueda](search.md), [reproducción](playback.md), [almacenamiento/voz](tracks-storage-voice.md) y [capacidades](backend-compatibility.md).

| Exportación | Declaración |
| --- | --- |
| `AudioNodeStatus` | [tipos](../dist/src/logging/LogFormatter.d.ts) |
| `BackendAdapter` | [tipos](../dist/src/backends/BackendAdapter.d.ts) |
| `BackendDetector` | [tipos](../dist/src/backends/BackendDetector.d.ts) |
| `BackendKind` | [tipos](../dist/src/backends/BackendAdapter.d.ts) |
| `CapabilityState` | [tipos](../dist/src/backends/BackendAdapter.d.ts) |
| `Connectors` | [tipos](../dist/src/connectors/index.d.ts) |
| `ConsoleReporter` | [tipos](../dist/src/logging/ConsoleReporter.d.ts) |
| `createBanner` | [tipos](../dist/src/logging/Banner.d.ts) |
| `DeezerSource` | [tipos](../dist/src/sources/deezer.d.ts) |
| `FadingCurve` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `FailoverOptions` | [tipos](../dist/src/nodes/NodeFailover.d.ts) |
| `FailoverReport` | [tipos](../dist/src/logging/LogFormatter.d.ts) |
| `FailoverResult` | [tipos](../dist/src/nodes/NodeFailover.d.ts) |
| `FeatureUnavailableError` | [tipos](../dist/src/errors/FeatureUnavailableError.d.ts) |
| `Filters` | [tipos](../dist/src/entities/Filters.d.ts) |
| `formatBox` | [tipos](../dist/src/logging/LogFormatter.d.ts) |
| `formatEntry` | [tipos](../dist/src/logging/LogFormatter.d.ts) |
| `formatFailover` | [tipos](../dist/src/logging/LogFormatter.d.ts) |
| `formatSystemStatus` | [tipos](../dist/src/logging/LogFormatter.d.ts) |
| `HttpError` | [tipos](../dist/src/errors/HttpError.d.ts) |
| `IChannelMix` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IChapter` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IChapterThumbnail` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IChorus` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ICompressor` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IDeezerOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IDefaultPlayerOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IDistortion` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IEcho` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IEqualizerBand` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IFadingOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IFadingSection` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IFailingAddress` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IFilters` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IHighPass` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IIpBlock` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IKaraoke` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ILowPass` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ILyricsData` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ILyricsLine` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ILyricsResponse` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IManagerConfig` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IManagerEvents` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IManagerNodeConfig` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IManagerOptionsConfig` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IMeaningResponse` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `INode` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `INodeConnectionMetrics` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `INodeConnectionStatus` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `INodeFailoverReport` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `INodeOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `INodeStats` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IpBlockType` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IPhaser` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IPlayerConfig` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IPlayerDestructionOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IPlayerHealthOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IPlayerState` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IQueueOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRESTGetLyrics` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRESTGetPlayers` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRESTLoadTracks` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRESTOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRotation` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRoutePlannerDetails` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IRoutePlannerStatus` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ISearchOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ISearchQuery` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ISourceOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ISpatial` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ISpotifyOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ITimescale` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ITrack` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ITrackHandlingOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ITrackInfo` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `ITremolo` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IVibrato` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `IVoiceConnectionOptions` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `LavalinkAdapter` | [tipos](../dist/src/backends/LavalinkAdapter.d.ts) |
| `LoadType` | [tipos](../dist/src/typings/types.d.ts) |
| `Local` | [tipos](../dist/src/database/Local.d.ts) |
| `Logger` | [tipos](../dist/src/logging/Logger.d.ts) |
| `LoggerOptions` | [tipos](../dist/src/logging/Logger.d.ts) |
| `Manager` | [tipos](../dist/src/core/Manager.d.ts) |
| `Memory` | [tipos](../dist/src/database/Memory.d.ts) |
| `Node` | [tipos](../dist/src/entities/Node.d.ts) |
| `NodeFailover` | [tipos](../dist/src/nodes/NodeFailover.d.ts) |
| `NodeHealth` | [tipos](../dist/src/nodes/NodeHealthMonitor.d.ts) |
| `NodeHealthMonitor` | [tipos](../dist/src/nodes/NodeHealthMonitor.d.ts) |
| `NodeLinkAdapter` | [tipos](../dist/src/backends/NodeLinkAdapter.d.ts) |
| `NodeManager` | [tipos](../dist/src/managers/NodeManager.d.ts) |
| `NodeSelector` | [tipos](../dist/src/nodes/NodeSelector.d.ts) |
| `NodeState` | [tipos](../dist/src/typings/types.d.ts) |
| `NyxLogLevel` | [tipos](../dist/src/logging/LogLevels.d.ts) |
| `Player` | [tipos](../dist/src/entities/Player.d.ts) |
| `PlayerManager` | [tipos](../dist/src/managers/PlayerManager.d.ts) |
| `Queue` | [tipos](../dist/src/entities/Queue.d.ts) |
| `Rest` | [tipos](../dist/src/entities/Rest.d.ts) |
| `RoutePlannerType` | [tipos](../dist/src/typings/Interfaces.d.ts) |
| `SearchResult` | [tipos](../dist/src/structures/SearchResult.d.ts) |
| `SpotifySource` | [tipos](../dist/src/sources/spotify.d.ts) |
| `StorageAdapter` | [tipos](../dist/src/database/StorageAdapter.d.ts) |
| `Track` | [tipos](../dist/src/entities/Track.d.ts) |
| `TrackCodec` | [tipos](../dist/src/tracks/TrackCodec.d.ts) |
| `TrackResolutionError` | [tipos](../dist/src/tracks/TrackResolver.d.ts) |
| `TrackResolver` | [tipos](../dist/src/tracks/TrackResolver.d.ts) |
| `TrackSnapshot` | [tipos](../dist/src/tracks/TrackCodec.d.ts) |
| `version` | [tipos](../dist/index.d.ts) |
| `VoiceConnectionState` | [tipos](../dist/src/typings/types.d.ts) |
| `VoicePacketHandler` | [tipos](../dist/src/entities/VoicePacketHandler.d.ts) |
| `VoiceReceiver` | [tipos](../dist/src/entities/VoiceReceiver.d.ts) |
| `WebSocket` | [tipos](../dist/src/services/WebSocket.d.ts) |
| `YouTubeLiveChat` | [tipos](../dist/src/entities/YouTubeLiveChat.d.ts) |

## Logger

```ts
class Logger {
  constructor(options?: LoggerOptions);
  setLevel(level: NyxLogLevel): void;
  for(module: string): import("consola").ConsolaInstance;
  info(module: string, message: string, ...args: unknown[]): void;
  success(module: string, message: string, ...args: unknown[]): void;
  warn(module: string, message: string, ...args: unknown[]): void;
  error(module: string, message: string, ...args: unknown[]): void;
  debug(module: string, message: string, ...args: unknown[]): void;
  trace(module: string, message: string, ...args: unknown[]): void;
  box(module: string, title: string, fields: Record<string, unknown>): void;
  banner(): void;
  systemStatus(nodes: AudioNodeStatus[]): void;
  failover(event: FailoverReport): void;
  attachLegacyDebug(source: DebugSource): () => void;
  managerStatus(manager: Manager): void;
  attachManager(manager: Manager): () => void;
}
```

## Manager

```ts
class Manager {
  initialized: boolean;
  readonly options: IManagerOptionsConfig;
  send: (guildId: string, payload: any) => void;
  clientId: string;
  readonly nodes: any;
  readonly players: PlayerManager;
  database: DatabaseManager;
  readonly logger?: Logger;
  get destroyed(): boolean;
  get readyNodes(): any;
  get hasReadyNodes(): any;
  constructor(config: IManagerConfig);
  detachLogger(): void;
  use(connector: Connector, client: any): this;
  init(clientId: string): Promise<this>;
  shutdown(): Promise<void>;
  search(options: ISearchQuery): Promise<any>;
  packetUpdate(packet: DiscordGatewayPacket): Promise<void>;
  decodeTrack(encoded: string): ITrack;
  encodeTrack(track: ITrackInfo): string;
}
```

## Node

```ts
class Node {
  readonly manager: Manager;
  readonly uuid: string;
  host: string;
  port: number;
  identifier: string;
  password: string;
  pathVersion: string;
  connected: boolean;
  destroyed: boolean;
  reconnectTimeout?: NodeJS.Timeout;
  reconnectAttempts: number;
  retryAmount: number;
  retryDelay: number;
  resumed: boolean;
  resumeTimeout: number;
  regions: string[];
  secure: boolean;
  sessionId: string;
  priority?: number;
  socket: WebSocket;
  stats?: INodeStats;
  statsReceivedAt?: number;
  info?: any;
  version?: string;
  isNodeLink: boolean;
  backend?: BackendAdapter;
  url: string;
  rest: Rest;
  state: NodeState;
  capabilities: Set<string>;
  constructor(manager: Manager, config: IManagerNodeConfig);
  get latency(): number;
  get health(): import("../nodes/NodeHealthMonitor").NodeHealth;
  assertFeature(feature: string): void;
  getPenalties(): number;
  ping(): Promise<number>;
  createYouTubeLiveChat(identifier: string, options?: YouTubeLiveChatOptions): YouTubeLiveChat;
  loadLyrics(track: string | ITrack | Track | { encoded?: string; }, lang?: string): Promise<NodeLinkResponse<ILyricsData | Record<string, any>> | null>;
  loadDirectStream(track: string | ITrack | Track | { encoded?: string; }, volume?: number, position?: number, filters?: IFilters | Record<string, any>): Promise<{ stream: NodeJS.ReadableStream; headers: Record<string, any>; }>;
  getDirectStream(track: string | ITrack | Track | { encoded?: string; }, itag?: number | null): Promise<any | null>;
  get address(): string;
  setState(state: NodeState): void;
  connect(): Promise<void>;
  reconnect(): void;
  updateRecommendations(player: any, track?: Track): Promise<void>;
  handleAutoPlay(player: any, previousTrack: any): Promise<boolean>;
  destroy(): Promise<void>;
}
```

## NodeManager

```ts
class NodeManager {
  readonly manager: Manager;
  readonly nodes: Map<string, any>;
  constructor(manager: Manager, nodeConfigs: IManagerNodeConfig[]);
  init(): void;
  add(config: IManagerNodeConfig): void;
  remove(identifier: string): boolean;
  get onlineNodes(): any[];
  get hasOnlineNodes(): boolean;
  get ready(): any[];
  get hasReady(): boolean;
  get leastUsedNode(): any | undefined;
  get stats(): Record<string, any>;
  findNode(options?: NodeSelectionOptions): any | undefined;
  eject(identifier: string): Promise<boolean>;
}
```

## Player

```ts
class Player {
  readonly manager: Manager;
  node: Node;
  readonly guildId: string;
  readonly queue: Queue;
  readonly filters: Filters;
  readonly voice: Voice;
  data: Record<string, unknown>;
  voiceChannelId: string;
  textChannelId: string;
  playing: boolean;
  paused: boolean;
  connected: boolean;
  destroyed: boolean;
  volume: number;
  loop: PlayerLoop;
  loopCount?: number;
  autoPlay: boolean;
  autoLeave: boolean;
  ping: number;
  isResuming: boolean;
  current: Track | null;
  previous: Track[];
  recommendations: Track[];
  historySize: number;
  lastActivityTime: number;
  lastPosition: number;
  lastPositionTime: number;
  stuckDetectionCount: number;
  silentDetectionCount: number;
  constructor(manager: Manager, node: Node, config: IPlayerConfig);
  startHealthCheck(): void;
  stopHealthCheck(): void;
  softRestart(reason: string): Promise<boolean>;
  updateActivity(): void;
  set(key: string, value: unknown): this;
  get<T>(key: string): T | undefined;
  updateData<T>(path?: string, data?: T): Promise<void>;
  updatePlayer(payload: Record<string, any>, noReplace?: boolean): Promise<any>;
  updateVoice(voice: Record<string, any>): Promise<any>;
  connect({ selfDeaf, selfMute }?: { selfDeaf?: boolean; selfMute?: boolean; }): Promise<this>;
  disconnect(): Promise<this>;
  play(options?: { track?: Track; encoded?: string; requester?: any; position?: number; noReplace?: boolean; audioTrackId?: string; } | Track): Promise<boolean>;
  playAutoPlay(track: Track, ticket: number, automaticTicket: number): Promise<boolean>;
  addMix(track: Track | string, options?: { volume?: number; userData?: Record<string, any>; }): Promise<any | null>;
  getMixes(): Promise<any | null>;
  updateMixVolume(mixId: string, volume: number): Promise<this>;
  removeMix(mixId: string): Promise<this>;
  subscribeLyrics(options?: { skipTrackSource?: boolean; }): Promise<this>;
  unsubscribeLyrics(): Promise<this>;
  loadChapters(encodedTrack?: string): Promise<NodeLinkResponse<IChapter[]> | null>;
  loadMeaning(encodedTrack?: string, lang?: string): Promise<NodeLinkResponse<IMeaningResponse | Record<string, any>> | null>;
  getLoadDirectStream(options?: { volume?: number; position?: number; filters?: IFilters | Record<string, any>; }): Promise<{ stream: NodeJS.ReadableStream; headers: Record<string, any>; }>;
  getDirectStream(itag?: number | null): Promise<any | null>;
  setFading(fading: IFadingOptions): Promise<this>;
  clearFading(): Promise<this>;
  setNextTrack(track: Track | string, userData?: Record<string, any>): Promise<this>;
  clearNextTrack(): Promise<this>;
  setAudioTrackId(audioTrackId?: string): this;
  setLoudnessNormalizer(enabled: boolean): Promise<this>;
  createVoiceReceiver(options?: VoiceReceiverOptions): VoiceReceiver;
  pause(): Promise<this>;
  resume(options?: { timeout?: number; }): Promise<this>;
  forward(ms: number): Promise<this>;
  rewind(ms: number): Promise<this>;
  setVoiceState(state: { channelId?: string; selfMute?: boolean; selfDeaf?: boolean; }): Promise<this>;
  toggleMute(): Promise<this>;
  toggleDeaf(): Promise<this>;
  search(query: string, source?: string): Promise<any>;
  stop(): Promise<this>;
  skip(position?: number): Promise<boolean>;
  seek(position: number): Promise<this>;
  setVolume(volume: number): this;
  setVolumeAsync(volume: number): Promise<this>;
  setLoop(loop: PlayerLoop, count?: number): this;
  setAutoPlay(autoPlay: boolean): this;
  setAutoLeave(autoLeave: boolean): this;
  shuffle(): this;
  destroy(reason?: string): Promise<void>;
  restart(options?: { destroyOnFailure?: boolean; startQueued?: boolean; }): Promise<boolean>;
  transferNode(node: Node | string): Promise<boolean>;
  setVoiceChannelId(voiceChannelId: string): this;
  setTextChannelId(textChannelId: string): this;
  replay(): Promise<boolean>;
  back(): Promise<boolean>;
}
```

## PlayerManager

```ts
class PlayerManager {
  readonly manager: Manager;
  readonly players: Map<string, Player>;
  constructor(manager: Manager);
  get all(): Player[];
  create(options: IPlayerConfig): Player;
  get(guildId: string): Player | undefined;
  has(guildId: string): boolean;
  get size(): number;
  get playingPlayers(): Player[];
  get idlePlayers(): Player[];
  filter(predicate: (player: Player) => boolean): Player[];
  find(predicate: (player: Player) => boolean): Player | undefined;
  map<T>(callback: (player: Player) => T): T[];
  forEach(callback: (player: Player) => void): void;
  clear(): Promise<void>;
  destroyAll(): Promise<void>;
  destroy(guildId: string, reason?: string): Promise<boolean>;
}
```

## Queue

```ts
class Queue {
  tracks: Track[];
  constructor(player: Player);
  get size(): number;
  get first(): Track | undefined;
  get last(): Track | undefined;
  get isEmpty(): boolean;
  get duration(): number;
  get remainingDuration(): number;
  get all(): Track[];
  add(track: Track | Track[]): void;
  insert(index: number, track: Track | Track[]): void;
  get(position: number): Track | undefined;
  has(track: Track): boolean;
  remove(index?: number): Track | undefined;
  shift(): Track | undefined;
  unshift(track: Track): void;
  pop(): Track | undefined;
  clear(): void;
  shuffle(): void;
  shuffleRange(start: number, end: number): void;
  removeDuplicates(): boolean;
  sortByTitle(): void;
  sortByAuthor(): void;
  sortByDuration(): void;
  find(query: string): Track | undefined;
  move(from: number, to: number): boolean;
  moveRange(fromIndex: number, toIndex: number, count: number): boolean;
  removeRange(startIndex: number, endIndex: number): boolean;
  duplicate(index: number, count?: number): boolean;
  jump(index: number): boolean;
  slice(start: number, end?: number): Track[];
  filter(predicate: (track: Track) => boolean): Track[];
  reverse(): void;
  [Symbol.iterator](): Iterator<Track>;
  map<U>(callback: (track: Track, index: number, array: Track[]) => U): U[];
  at(index: number): Track | undefined;
  swap(index1: number, index2: number): boolean;
  replace(index: number, track: Track): boolean;
  removeWhere(predicate: (track: Track) => boolean): Track[];
  truncate(size: number): boolean;
}
```

## Rest

```ts
class Rest {
  constructor(node: Node);
  get url(): string;
  getPlayers(): Promise<IRESTGetPlayers[] | null>;
  getPlayer(guildId: string): Promise<any | null>;
  updatePlayer(guildId: string, data: any, noReplace?: boolean): Promise<any | null>;
  destroyPlayer(guildId: string): Promise<void>;
  loadTracks(identifier: string, options?: { timeoutMs: number; signal?: AbortSignal; }): Promise<IRESTLoadTracks>;
  decodeTrack(encodedTrack: string): Promise<ITrack | null>;
  decodeTracks(encodedTracks: string[]): Promise<ITrack[] | null>;
  getInfo(): Promise<any | null>;
  getInfoWithHeaders(): Promise<ResponseWithHeaders<any> | null>;
  getVersion(timeout?: number, retries?: number): Promise<string | null>;
  getStats(): Promise<INodeStats | null>;
  getRoutePlannerStatus(): Promise<IRoutePlannerStatus | null>;
  freeFailedAddress(address: string): Promise<void>;
  freeAllFailedAddresses(): Promise<void>;
  updateSession(resuming: boolean, timeout: number): Promise<any | null>;
  addMixLayer(guildId: string, data: { track: { encoded: string; userData?: Record<string, any>; }; volume?: number; }): Promise<any | null>;
  getMixLayers(guildId: string): Promise<any | null>;
  updateMixLayerVolume(guildId: string, mixId: string, volume: number): Promise<void>;
  removeMixLayer(guildId: string, mixId: string): Promise<void>;
  loadLyrics(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<ILyricsData | Record<string, any>> | null>;
  loadChapters(encodedTrack: string): Promise<NodeLinkResponse<IChapter[]> | null>;
  loadMeaning(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<IMeaningResponse | Record<string, any>> | null>;
  getConnectionStatus(): Promise<NodeLinkResponse<INodeConnectionStatus> | null>;
  getMetrics(): Promise<string | null>;
  getWorkers(): Promise<NodeLinkResponse<any[]> | null>;
  patchWorker(payload: Record<string, any>): Promise<any | null>;
  getYoutubeConfig(validate?: boolean): Promise<any | null>;
  updateYoutubeConfig(payload: { refreshToken?: string; visitorData?: string; }): Promise<any | null>;
  exchangeYoutubeOAuth(refreshToken: string): Promise<any | null>;
  encodeTrackRemote(track: string): Promise<string | null>;
  encodeTracksRemote(tracks: Array<{ encoded: string; info: Record<string, any>; }>): Promise<string[] | null>;
  trackStream(encodedTrack: string, itag?: number | null): Promise<any | null>;
  loadStream(payload: { encodedTrack: string; volume?: number; position?: number; format?: 'pcm' | 'wav'; filters?: IFilters | Record<string, any>; }, options?: { signal?: AbortSignal; timeoutMs?: number; }): Promise<{ stream: NodeJS.ReadableStream; headers: Record<string, any>; }>;
  subscribeLyrics(guildId: string, skipTrackSource?: boolean): Promise<void>;
  unsubscribeLyrics(guildId: string): Promise<void>;
}
```

## SearchResult

```ts
class SearchResult {
  loadType: LoadType;
  tracks: Track[];
  playlistInfo?: { name: string; selectedTrack: number; duration: number; };
  exception?: { message: string; severity: string; };
  constructor(response: IRESTLoadTracks, requester?: any, playlistLoadLimit?: number);
  get isPlaylist(): boolean;
  get isTrack(): boolean;
  get isSearch(): boolean;
  get isEmpty(): boolean;
  get isError(): boolean;
}
```

## Track

```ts
class Track {
  readonly encoded: string;
  title: string;
  author: string;
  duration: number;
  identifier: string;
  isSeekable: boolean;
  isStream: boolean;
  uri: string | null;
  artworkUrl: string | null;
  isrc: string | null;
  sourceName: string;
  position: number;
  time: number;
  requester: any;
  origin?: string;
  backend?: BackendKind;
  pluginInfo: Record<string, any>;
  userData: Record<string, any>;
  retries: number;
  constructor(data: ITrack | Record<string, any>, requester?: any, origin?: string);
  isPartialTrack(): boolean;
  get thumbnail(): string | null;
  setRequester(requester: any): this;
  setPosition(position: number): this;
  clone(): Track;
  toJSON(): ITrack;
}
```

## TrackCodec

```ts
class TrackCodec {
  static encode(info: ITrackInfo): string;
  static decode(encoded: string): ITrack;
  static serialize(track: Track): TrackSnapshot;
  static restore(data: Partial<TrackSnapshot> & { encoded: string; position?: number; }): Track;
}
```

## TrackResolver

```ts
class TrackResolver {
  static resolve(track: Track, target: Node, source?: Node): Promise<Track>;
}
```
