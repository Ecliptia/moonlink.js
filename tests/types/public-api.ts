import { Manager, Player, Node, Track, Queue, Rest, Filters, SearchResult, NodeManager, PlayerManager, WebSocket, Connectors, VoiceReceiver, YouTubeLiveChat, SpotifySource, DeezerSource, Logger, version } from '../../dist';

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
void [asyncVolume, detach, playing, stopping, volume, autoplay, transfer, search, queue, Rest, Filters, SearchResult, NodeManager, PlayerManager, WebSocket, Connectors, VoiceReceiver, YouTubeLiveChat, SpotifySource, DeezerSource, Logger, version];
