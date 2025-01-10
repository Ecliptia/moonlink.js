import { Database, Player, Structure, Track } from "../../index";
export class Queue {
  public database: Database;
  public guildId: string;
  constructor(player: Player) {
    this.database = player.manager.database;
    this.guildId = player.guildId;
  }
  public tracks: Track[] = [];

  public add(track: Track): boolean {
    this.tracks.push(track);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }
  public get(position: number): Track {
    return this.tracks[position];
  }
  public has(track: Track): boolean {
    return this.tracks.includes(track);
  }
  public remove(position: number): boolean {
    this.tracks.splice(position, 1);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }
  public shift(): Track {
    let track = this.tracks.shift();
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return track;
  }
  public unshift(track: Track): boolean {
    this.tracks.unshift(track);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }
  public pop(): Track {
    let tracks = this.tracks.pop();
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return tracks;
  }
  public clear(): boolean {
    this.tracks = [];
    this.database.delete(`queues.${this.guildId}`);
    return true;
  }
  public shuffle(): boolean {
    this.tracks = this.tracks.sort(() => Math.random() - 0.5);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }
  public get size(): number {
    return this.tracks.length;
  }
}
