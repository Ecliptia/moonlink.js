"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStructures = registerStructures;
const Utils_1 = require("../Utils");
const Database_1 = require("../entities/Database");
const NodeManager_1 = require("../management/NodeManager");
const PlayerManager_1 = require("../management/PlayerManager");
const SearchResult_1 = require("./SearchResult");
const Player_1 = require("../entities/Player");
const Queue_1 = require("../entities/Queue");
const Node_1 = require("../entities/Node");
const Rest_1 = require("../entities/Rest");
const Filters_1 = require("../entities/Filters");
const Track_1 = require("../entities/Track");
const Lyrics_1 = require("../entities/Lyrics");
const Listen_1 = require("../entities/Listen");
function registerStructures() {
    Utils_1.Structure.register("Database", Database_1.Database);
    Utils_1.Structure.register("NodeManager", NodeManager_1.NodeManager);
    Utils_1.Structure.register("PlayerManager", PlayerManager_1.PlayerManager);
    Utils_1.Structure.register("SearchResult", SearchResult_1.SearchResult);
    Utils_1.Structure.register("Player", Player_1.Player);
    Utils_1.Structure.register("Queue", Queue_1.Queue);
    Utils_1.Structure.register("Node", Node_1.Node);
    Utils_1.Structure.register("Rest", Rest_1.Rest);
    Utils_1.Structure.register("Filters", Filters_1.Filters);
    Utils_1.Structure.register("Track", Track_1.Track);
    Utils_1.Structure.register("Lyrics", Lyrics_1.Lyrics);
    Utils_1.Structure.register("Listen", Listen_1.Listen);
}
//# sourceMappingURL=Register.js.map