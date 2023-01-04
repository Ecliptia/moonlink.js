import { MoonlinkManager } from './@Types/MoonlinkManager';

declare const version: string;

declare module.exports: {
  MoonlinkManager: typeof MoonlinkManager;
  version: string;
}
