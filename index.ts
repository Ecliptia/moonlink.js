export const version: string = require("../package.json").version as string;

export * from "./src/core/Manager";
export * from "./src/management/NodeManager";
export * from "./src/management/PlayerManager";
export * from "./src/typings/Interfaces";
export * from "./src/typings/types"
export * from "./src/Utils";
export * from "./src/entities/Player";
export * from "./src/entities/Node";
export * from "./src/entities/Rest";
export * from "./src/entities/Track";
export * from "./src/entities/Queue";
export * from "./src/entities/Listen";
export * from "./src/entities/Lyrics";

