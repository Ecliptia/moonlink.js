
  class MoonQueue {
    guildId: string;

    constructor(data: { guildId: string });
    add(track: any): void;
    first(): any | null;
    readonly all: any | null;
    clear(): void | TypeError;
    readonly size: number;
  }

  const MoonQueue: MoonQueue;
  export { MoonQueue };

