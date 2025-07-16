export const version: string = require("../package.json").version as string;

export * from "./src/typings/Interfaces";
export * from "./src/typings/types";
export * from "./src/Utils";
export * from "./src/core/Manager";
export * from "./src/management/NodeManager";
export * from "./src/management/PlayerManager";
export * from "./src/management/PluginManager";
export * from "./src/management/SourceManager";
export * from "./src/structures/SearchResult";
export * from "./src/management/DatabaseManager";
export * from "./src/database/AbstractDatabase";
export * from "./src/entities/Filters";
export * from "./src/entities/Player";
export * from "./src/entities/Node";
export * from "./src/entities/Rest";
export * from "./src/entities/Track";
export * from "./src/entities/Queue";
export * from "./src/entities/Listen";
export * from "./src/entities/Lyrics";

import { structures } from "./src/Utils";

[["DatabaseManager","./src/management/DatabaseManager"],["NodeManager","./src/management/NodeManager"],["PlayerManager","./src/management/PlayerManager"],["PluginManager","./src/management/PluginManager"],["SearchResult","./src/structures/SearchResult"],
["Player","./src/entities/Player"],["Queue","./src/entities/Queue"],["Node","./src/entities/Node"],
["Rest","./src/entities/Rest"],["Filters","./src/entities/Filters"],["Track","./src/entities/Track"],
["Lyrics","./src/entities/Lyrics"],["Listen","./src/entities/Listen"],["SourceManager", "./src/management/SourceManager"]].map(([n,p])=>structures[n]=require(p)[n]);