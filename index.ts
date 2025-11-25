export const version: string = require("../package.json").version as string;
import { Structure } from "./src/Util";
import { Manager } from "./src/core/Manager";
import { Node } from "./src/entities/Node";
import { Player } from "./src/entities/Player";
import { Queue } from "./src/entities/Queue";
import { Rest } from "./src/entities/Rest";
import { Filters } from "./src/entities/Filters";
import { Track } from "./src/entities/Track";
import { SearchResult } from "./src/structures/SearchResult";
import { NodeManager } from "./src/managers/NodeManager";
import { PlayerManager } from "./src/managers/PlayerManager";
import { WebSocket } from "./src/services/WebSocket";
import { Connectors } from "./src/connectors";

Structure.register("Node", Node);
Structure.register("Player", Player);
Structure.register("Queue", Queue);
Structure.register("Rest", Rest);
Structure.register("Filters", Filters);
Structure.register("Track", Track);
Structure.register("SearchResult", SearchResult);
Structure.register("NodeManager", NodeManager);
Structure.register("PlayerManager", PlayerManager);
Structure.register("WebSocket", WebSocket);

export {
    Manager,
    Node,
    Player,
    Queue,
    Rest,
    Filters,
    Track,
    SearchResult,
    NodeManager,
    PlayerManager,
    WebSocket,
    Connectors,
};