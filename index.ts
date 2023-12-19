import packageJson from "./package.json";

export const version: string = packageJson.version as string;

export * from "./src/@Managers/MoonlinkManager";
export * from "./src/@Entities/MoonlinkNode";
export * from "./src/@Entities/MoonlinkPlayer";
export * from "./src/@Entities/MoonlinkQueue";
export * from "./src/@Services/MoonlinkMakeRequest";
export * from "./src/@Services/MoonlinkRestFul";
export * from "./src/@Services/PerforCWebsocket";
export * from "./src/@Typings/";
export * from "./src/@Utils/MoonlinkDatabase";
export * from "./src/@Utils/MoonlinkFilters";
export * from "./src/@Utils/MoonlinkTrack";
export * from "./src/@Utils/Structure";
