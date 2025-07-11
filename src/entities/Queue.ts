import { Database, Player, Structure, Track } from "../../index";
export class Queue {
  public database: Database;
  public guildId: string;
  public player: Player;
  constructor(player: Player) {
    this.database = player.manager.database;
    this.guildId = player.guildId;
    this.player = player;
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
    this.player.manager.emit("queueAdd", this.player, track);
    return true;
  }
  public get(position: number): Track {
    return this.tracks[position];
  }
  public has(track: Track): boolean {
    return this.tracks.includes(track);
  }
  public remove(position: number): boolean {
    const removed = this.tracks.splice(position, 1);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    this.player.manager.emit("queueRemove", this.player, removed[0]);
    return true;
  }
  public shift(): Track {
    let track = this.tracks.shift();
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    if (track) {
      this.player.manager.emit("queueRemove", this.player, track);
    }
    return track;
  }
  public unshift(track: Track): boolean {
    this.tracks.unshift(track);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    this.player.manager.emit("queueAdd", this.player, track);
    return true;
  }
  public pop(): Track {
    let tracks = this.tracks.pop();
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    if (tracks) {
      this.player.manager.emit("queueRemove", this.player, tracks);
    }
    return tracks;
  }
  public clear(): boolean {
    const clearedTracks = [...this.tracks];
    this.tracks = [];
    this.database.delete(`queues.${this.guildId}`);
    this.player.manager.emit("queueRemove", this.player, clearedTracks);
    return true;
  }
  public shuffle(): boolean {
    this.tracks = this.tracks.sort(() => Math.random() - 0.5);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }

  public removeDuplicates(): boolean {
    if (this.tracks.length < 2) return false;

    const uniqueTracks: Track[] = [];
    const seenEncoded: Set<string> = new Set();

    for (const track of this.tracks) {
        if (!seenEncoded.has(track.encoded)) {
            uniqueTracks.push(track);
            seenEncoded.add(track.encoded);
        }
    }

    if (uniqueTracks.length === this.tracks.length) {
        return false;
    }

    this.tracks = uniqueTracks;
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }

  public sortByTitle(): boolean {
    if (this.tracks.length < 2) return false;
    this.tracks.sort((a, b) => a.title.localeCompare(b.title));
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }

  public sortByAuthor(): boolean {
    if (this.tracks.length < 2) return false;
    this.tracks.sort((a, b) => a.author.localeCompare(b.author));
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    return true;
  }

  public sortByDuration(): boolean {
    if (this.tracks.length < 2) return false;
    this.tracks.sort((a, b) => a.duration - b.duration);
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

  public moveRange(fromIndex: number, toIndex: number, count: number): boolean {
    if (fromIndex < 0 || fromIndex >= this.tracks.length ||
        toIndex < 0 || toIndex > this.tracks.length ||
        count <= 0 || fromIndex + count > this.tracks.length) {
      return false;
    }

    const tracksToMove = this.tracks.splice(fromIndex, count);
    this.tracks.splice(toIndex, 0, ...tracksToMove);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    this.player.manager.emit("queueMoveRange", this.player, tracksToMove, fromIndex, toIndex);
    return true;
  }

  public removeRange(startIndex: number, endIndex: number): boolean {
    if (startIndex < 0 || startIndex >= this.tracks.length ||
        endIndex < startIndex || endIndex >= this.tracks.length) {
      return false;
    }

    const removedTracks = this.tracks.splice(startIndex, endIndex - startIndex + 1);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    this.player.manager.emit("queueRemoveRange", this.player, removedTracks, startIndex, endIndex);
    return true;
  }

  public duplicate(index: number, count: number = 1): boolean {
    if (index < 0 || index >= this.tracks.length || count <= 0) {
      return false;
    }

    const trackToDuplicate = this.tracks[index];
    const duplicatedTracks: Track[] = [];
    for (let i = 0; i < count; i++) {
      duplicatedTracks.push(trackToDuplicate); // Add reference, not deep copy
    }

    this.tracks.splice(index + 1, 0, ...duplicatedTracks);
    this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
    this.player.manager.emit("queueDuplicate", this.player, duplicatedTracks, index);
    return true;
  }

  public jump(index: number): boolean {
    if (index < 0 || index >= this.tracks.length) return false;

    if (index === 0) return true;

    const tracksToSkip = this.tracks.splice(0, index);
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
