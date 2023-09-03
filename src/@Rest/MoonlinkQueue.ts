import { MoonlinkDatabase } from "./MoonlinkDatabase";
import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
import { MoonlinkTrack } from "./MoonlinkTrack";

export class MoonlinkQueue {
  public db: MoonlinkDatabase;
  private guildId: string;
  private manager: MoonlinkManager;

  constructor(manager: MoonlinkManager, data: { guildId: string }) {
    if (!manager || !data || !data.guildId) {
      throw new Error('[ @Moonlink/Queue ]: Invalid constructor arguments');
    }

    this.db = new MoonlinkDatabase();
    this.guildId = data.guildId;
    this.manager = manager;
  }

  public add(data: MoonlinkTrack, position?: number): void {
    if (!data) throw new Error('[ @Moonlink/Queue ]: "data" option is empty');

    let queue = this.getQueue();
    position = (position !== undefined && position >= 1) ? position - 1 : queue.length;

    if (position < 0 || position > queue.length) {
      throw new Error('[ @Moonlink/Queue ]: Invalid position specified');
    }

    queue.splice(position, 0, data);
    this.setQueue(queue);
  }

  public first(): any {
    const queue = this.getQueue();
    return queue.length > 0 ? queue[0] : null;
  }

  public clear(): boolean {
    const queue = this.getQueue();
    if (queue.length > 0) {
      this.setQueue([]);
      return true;
    }
    return false;
  }

  public get size(): number {
    return this.getQueue().length;
  }

  public remove(position: number): boolean {
    if (!position || typeof position !== 'number' || position < 1) {
      throw new Error('[ @Moonlink/Queue ]: Invalid position specified');
    }

    const queue = this.getQueue();

    if (position > queue.length) {
      throw new Error('[ @Moonlink/Queue ]: Position exceeds queue length');
    }

    queue.splice(position - 1, 1);
    this.setQueue(queue);
    return true;
  }

  public get all(): any {
    return this.getQueue();
  }

  private getQueue(): MoonlinkTrack[] {
    return this.db.get(`queue.${this.guildId}`) || [];
  }

  private setQueue(queue: MoonlinkTrack[]): void {
    this.db.set(`queue.${this.guildId}`, queue);
  }
}