import { MoonlinkManager } from './@Moonlink/MoonlinkManager.js';

declare const version: string;

declare module.exports: {
  MoonlinkManager: typeof MoonlinkManager;
  version: string;
}
