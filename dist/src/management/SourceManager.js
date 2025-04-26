"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceManager = void 0;
const index_1 = require("../../index");
class SourceManager {
    manager;
    sources;
    constructor(manager) {
        this.manager = manager;
        this.sources = {};
        this.loadFolder();
    }
    add(source) {
        (0, index_1.validateProperty)(source.name, value => !!value, "(Moonlink.js) - Source > Name is required");
        this.sources[source.name] = source;
        this.manager.emit("sourceAdd", source);
        this.manager.emit("debug", `Moonlink.js > Source > ${source.name} added`);
    }
    get(name) {
        return this.sources[name];
    }
    has(name) {
        return !!this.sources[name];
    }
    remove(name) {
        if (!this.sources[name])
            return;
        delete this.sources[name];
        this.manager.emit("sourceRemove", name);
        this.manager.emit("debug", `Moonlink.js > Source > ${name} removed`);
    }
    clear() {
        this.sources = {};
        this.manager.emit("sourceClear");
        this.manager.emit("debug", "Moonlink.js > All sources native removed");
    }
    getAll() {
        return Object.values(this.sources);
    }
    loadFolder() {
        const fs = require("fs");
        const path = require("path");
        const folderPath = path.join(__dirname, "../sources/");
        fs.readdir(folderPath, (err, files) => {
            if (err)
                throw err;
            files.forEach((file) => {
                if (file.endsWith(".js")) {
                    const source = require(path.join(folderPath, file)).default;
                    if (!source)
                        return;
                    this.add(new source(this.manager));
                }
            });
        });
    }
    isLinkMatch(url, _unusedSourceParam) {
        for (const src of Object.values(this.sources)) {
            if (src.match(url)) {
                return [true, src.name];
            }
        }
        return [false, null];
    }
}
exports.SourceManager = SourceManager;
//# sourceMappingURL=SourceManager.js.map