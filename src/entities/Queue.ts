import { Track } from "../../index";
export class Queue {
  public tracks: Track[] = [];

  public add(track: Track): boolean {
    this.tracks.push(track);
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
    return true;
  }
  public shift(): Track {
    return this.tracks.shift();
  }
  public unshift(track: Track): boolean {
    this.tracks.unshift(track);
    return true;
  }
  public pop(): Track {
    return this.tracks.pop();
  }
  public clear(): boolean {
    this.tracks = [];
    return true;
  }
  public get size(): number {
    return this.tracks.length;
  }
}
