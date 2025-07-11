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
        if (!this.manager.options.disableNativeSources) {
            this.manager.emit("debug", "Moonlink.js > Sources are enabled");
        }
        else {
            this.manager.emit("debug", "Moonlink.js > Sources are disabled");
            return;
        }
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
    async loadFolder() {
        const fs = require("fs").promises;
        const path = require("path");
        const folderPath = path.join(__dirname, "../sources/");
        try {
            const files = await fs.readdir(folderPath);
            for (const file of files) {
                if (file.endsWith(".js")) {
                    const sourceName = file.replace(".js", "");
                    if (this.manager.options.enabledSources && !this.manager.options.enabledSources.includes(sourceName)) {
                        this.manager.emit("debug", `Moonlink.js > Source > ${sourceName} skipped (not in enabledSources).`);
                        continue;
                    }
                    try {
                        const source = require(path.join(folderPath, file)).default;
                        if (!source) {
                            this.manager.emit("debug", `Moonlink.js > Source > ${sourceName} has no default export.`);
                            continue;
                        }
                        this.add(new source(this.manager));
                    }
                    catch (error) {
                        this.manager.emit("debug", `Moonlink.js > Failed to load source ${sourceName}: ${error.message}`);
                    }
                }
            }
        }
        catch (err) {
            this.manager.emit("debug", `Moonlink.js > Error reading sources folder: ${err.message}`);
        }
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