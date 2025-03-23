import { Database, Player, Structure, Track } from "../../index";
export class Queue {
  public database: Database;
  public guildId: string;
  constructor(player: Player) {
    this.database = player.manager.database;
    this.guildId = player.guildId;
  }
  public tracks: Track[] = [];

  public add(track: Track | Track[]): boolean {
    if (Array.isArray(track)) {
      if (track.length === 0) return true;
      
      for (let t of track) {
      this.tracks.push(t);
      }
    } else {
      this.tracks.push(track);
    }
    
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
  public get duration(): number {
    return this.tracks.reduce((acc, cur) => acc + cur.duration, 0);
  }
  public get isEmpty(): boolean {
    return this.tracks.length === 0;
  }
  public get first(): Track {
    return this.tracks[0];
  }
  public get last(): Track {
    return this.tracks[this.tracks.length - 1];
  }
  public get all(): Track[] {
    return this.tracks;
  }
  public find(query: string): Track | undefined {
    const searchTerm = query.toLowerCase();
    return this.tracks.find(t => 
      t.identifier === query || 
      t.title.toLowerCase().includes(searchTerm)
    );
  }
  public move(from: number, to: number): boolean {
    if (from < 0 || to < 0 || from >= this.tracks.length || to >= this.tracks.length) return false;
    
    const track = this.tracks.splice(from, 1)[0];
    this.tracks.splice(to, 0, track);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }
  public slice(start: number, end?: number): Track[] {
    return this.tracks.slice(start, end);
  }
  public filter(predicate: (track: Track) => boolean): Track[] {
    return this.tracks.filter(predicate);
  }
  public reverse(): boolean {
    this.tracks.reverse();
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }
  public get position(): number {
    return this.tracks.findIndex(track => track === this.first);
  }
  public get previous(): Track[] {
    return this.tracks.slice(0, this.position);
  }
}
