import { MoonlinkDatabase } from "./MoonlinkDatabase";
import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
import { MoonlinkTrack } from "./MoonlinkTrack";
export class MoonlinkQueue {
 public db: MoonlinkDatabase;
 public guildId: string;
 private manager: MoonlinkManager;
 constructor(manager, data) {
  this.db = new MoonlinkDatabase();
  this.guildId = data.guildId;
  this.manager = manager;
 }
 public add(data: MoonlinkTrack, position?: number): void {
  if (!data) throw new Error('[ @Moonlink/Queue ]: "data" option is empty');
  let queue = this.db.get(`queue.${this.guildId}`);
	 if (typeof position !== 'undefined' && (position < 1 || position > queue.length + 1)) {
      throw new Error('[ @Moonlink/Queue ]: Invalid position specified');
    }
	 if (typeof position === 'undefined' || position > queue.length + 1) {
  if (Array.isArray(queue)) {
   this.db.push(`queue.${this.guildId}`, data);
  } else if (queue && queue.length > 0 && queue[0]) {
   queue = [queue, data];
   this.db.set(`queue.${this.guildId}`, queue);
  } else {
   this.db.push(`queue.${this.guildId}`, data);
     }
	 } else {
		 queue.splice(position - 1, 0, data);
		 this.db.set(`queue.${this.guildId}`, queue);
	 }
 }
 public first(): any {
  let queue = this.db.get(`queue.${this.guildId}`) || null;
  if (!queue) return null;
  if (Array.isArray(queue)) {
   return queue[0];
  } else if (queue && queue.length > 0 && queue[0]) return queue;
  else queue[0];
 }
 public clear(): boolean {
  let queue = this.db.get(`queue.${this.guildId}`) || null;
  if (!queue) return false;
  this.db.delete(`queue.${this.guildId}`);
  return true;
 }
 public get size(): BigInt {
  return this.db.get(`queue.${this.guildId}`)
   ? this.db.get(`queue.${this.guildId}`).length
   : 0;
 }
 public remove(position: number): boolean {
  if (!position && typeof position !== "number")
   throw new Error(
    '[ @Moonlink/Queue ]: option "position" is empty or different from number'
   );
  if (!this.size) throw new Error("[ @Moonlink/Queue ]: the queue is empty");
  let queue = this.db.get(`queue.${this.guildId}`);
  if (!queue[position - 1])
   throw new Error("[ @Moonlink/Queue ]: indicated position is undefined");
  queue.splice(position - 1, 1);
  this.db.set(`queue.${this.guildId}`, queue);
  return true;
 }
 public get all(): any {
  return this.db.get(`queue.${this.guildId}`)
   ? this.db.get(`queue.${this.guildId}`)
   : null;
 }
}
