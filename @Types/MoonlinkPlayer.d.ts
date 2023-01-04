import { EventEmitter } from 'events';
import { MoonQueue } from '../@Rest/MoonlinkQueue.js';
import { MoonFilters } from '../@Rest/MoonlinkFilters.js';

declare let sendDs: (guildId: string, data: string) => void;
declare let utils: {
  map: Map<string, any>;
  db: any;
  track: {
    current: () => any;
    editCurrent: (track: any) => void;
  };
};

declare let player: {
  [guildId: string]: {
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    playing: boolean;
    connected: boolean;
    paused: boolean;
    loop: boolean;
    current: any;
  }
};

declare class MoonPlayer {
  #sendWs: (data: any) => void;
  #manager: { sendWs: (data: any) => void };
  #infos: {
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    playing?: boolean;
    connected?: boolean;
    paused?: boolean;
    loop?: boolean;
  };
  guildId: string;
  textChannel: string;
  voiceChannel: string;
  playing: boolean | null;
  connected: boolean | null;
  paused: boolean | null;
  loop: boolean | null;
  current: any;
  queue: MoonQueue;
  filters: MoonFilters;

  constructor(infos: {
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    playing?: boolean;
    connected?: boolean;
    paused?: boolean;
    loop?: boolean;
  }, manager: { sendWs: (data: any) => void });

  connect(selfMute?: boolean, selfDeaf?: boolean): void;
  disconnect(): void;
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  next(): void;
  loop(): void;
  destroy(): void;
  shuffle(): void;
  volume(volume: number): void;
  setVoiceChannel(channelId: string): void;
  setTextChannel(channelId: string): void;
}
