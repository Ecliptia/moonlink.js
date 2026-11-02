import { Manager, Player, Node, Track, Queue, Rest, Filters, SearchResult, NodeManager, PlayerManager, WebSocket, Connectors, VoiceReceiver, YouTubeLiveChat, SpotifySource, DeezerSource, Logger, NodeSelector, NodeHealthMonitor, NodeFailover, BackendDetector, HttpError, FeatureUnavailableError, type FailoverResult, type StorageAdapter, type TrackSnapshot, TrackCodec, TrackResolver, TrackResolutionError, VoicePacketHandler, Memory, Local, version } from '../../dist';

declare const manager: Manager;
declare const player: Player;
declare const node: Node;
declare const track: Track;

const playing: Promise<boolean> = player.play({ track, position: 10 });
const stopping: Promise<Player> = player.stop();
const volume: Player = player.setVolume(75);
const asyncVolume: Promise<Player> = player.setVolumeAsync(75);
const logger = new Logger({ level: "debug", color: false });
const detach: () => void = logger.attachManager(manager);
manager.logger?.managerStatus(manager);
manager.detachLogger();
const autoplay: Player = player.setAutoPlay(false);
const transfer: Promise<boolean> = player.transferNode(node);
const search = manager.search({ query: 'test' });
const queue: Queue = player.queue;
const health = NodeHealthMonitor.inspect(node);
const selected = NodeSelector.select([node]);
const failover: Promise<FailoverResult> = NodeFailover.move(player, node, { maxAttempts: 2 });
const backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
const configuredNode: Parameters<NodeManager['add']>[0] = { host: 'localhost', port: 2333, password: 'test', secure: false, retryAmount: 0, readyTimeoutMs: 10000 };
void [health, selected, failover, backend, HttpError, FeatureUnavailableError, configuredNode];
void [asyncVolume, detach, playing, stopping, volume, autoplay, transfer, search, queue, Rest, Filters, SearchResult, NodeManager, PlayerManager, WebSocket, Connectors, VoiceReceiver, YouTubeLiveChat, SpotifySource, DeezerSource, Logger, version];

const snapshot: TrackSnapshot = TrackCodec.serialize(track);
const restored: Track = TrackCodec.restore(snapshot);
const resolved: Promise<Track> = TrackResolver.resolve(track, node);
const adapter: StorageAdapter = new Memory();
const local: StorageAdapter = new Local();
const configured = new Manager({ nodes: [configuredNode], options: { database: { type: 'memory', adapter } } });
const flushed: Promise<void> = manager.database.flush();
const packet: Promise<void> = VoicePacketHandler.handle(manager, {});
void [snapshot, restored, resolved, local, configured, flushed, packet, TrackResolutionError];

const shuttingDown: Promise<void> = manager.shutdown();
const isClosed: boolean = manager.destroyed;
const connector = new Connectors.DiscordJs();
const disposed: void = connector.dispose();
void [shuttingDown, isClosed, disposed];

const searchConfig = new Manager({ nodes: [configuredNode], options: { search: { timeoutMs: 1000, fallbackPlatforms: ['soundcloud'], cache: { ttlMs: 5000, maxEntries: 10 }, resolver: async (_query, _node) => null } } });
const cancellable = manager.search({ query: 'local fixture', signal: AbortSignal.timeout(1000) });
const streaming = node.rest.loadStream({ encodedTrack: track.encoded, format: 'wav' }, { signal: AbortSignal.timeout(1000), timeoutMs: 1000 });
void [searchConfig, cancellable, streaming];
