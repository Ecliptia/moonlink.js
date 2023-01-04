export declare class MoonlinkDB {
  data: any;

  constructor();

  set(key: string, value: any): any;
  get(key: string): any;
  push(key: string, value: any): any;
  delete(key: string): void;
  fetch(): void;
  #save(): void;
}
