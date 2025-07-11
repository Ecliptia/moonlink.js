import { Manager, validateProperty, ISource } from '../../index';
export class SourceManager {
  public readonly manager: Manager;
  public sources: Record<string, ISource>;
  constructor(manager: Manager) {
    this.manager = manager;
    this.sources = {};
    if (!this.manager.options.disableNativeSources) {
      this.manager.emit("debug", "Moonlink.js > Sources are enabled");
    } else {
      this.manager.emit("debug", "Moonlink.js > Sources are disabled");
      return;
    }

    this.loadFolder();
  }
    public add(source: ISource): void {
        validateProperty(
        source.name,
        value => !!value,
        "(Moonlink.js) - Source > Name is required"
        );
        this.sources[source.name] = source;
        this.manager.emit("sourceAdd", source);
        this.manager.emit("debug", `Moonlink.js > Source > ${source.name} added`);
    }
    public get(name: string): ISource | undefined {
        return this.sources[name];
    }
    public has(name: string): boolean {
        return !!this.sources[name];
    }
    public remove(name: string): void {
        if (!this.sources[name]) return;
        delete this.sources[name];
        this.manager.emit("sourceRemove", name);
        this.manager.emit("debug", `Moonlink.js > Source > ${name} removed`);
    }
    public clear(): void {
        this.sources = {};
        this.manager.emit("sourceClear");
        this.manager.emit("debug", "Moonlink.js > All sources native removed");
    }
    public getAll(): ISource[] {
        return Object.values(this.sources);
    }

    public async loadFolder() {
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
                    } catch (error: any) {
                        this.manager.emit("debug", `Moonlink.js > Failed to load source ${sourceName}: ${error.message}`);
                    }
                }
            }
        } catch (err: any) {
            this.manager.emit("debug", `Moonlink.js > Error reading sources folder: ${err.message}`);
        }
    }
    public isLinkMatch(url: string, _unusedSourceParam?: string): [boolean, string | null] {
        for (const src of Object.values(this.sources)) {
          if (src.match!(url)) {
            return [true, src.name];
          }}
        return [false, null];
      }
}