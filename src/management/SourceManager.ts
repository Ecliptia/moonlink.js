import { Manager, validateProperty, ISource } from '../../index';
export class SourceManager {
  public readonly manager: Manager;
  public sources: Record<string, ISource>;
  constructor(manager: Manager) {
    this.manager = manager;
    this.sources = {};
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
    public loadFolder() {
        const fs = require("fs");
        const path = require("path");
        const folderPath = path.join(__dirname, "../sources/");
        fs.readdir(folderPath, (err: any, files: string[]) => {
            if (err) throw err;
            files.forEach((file: string) => {
                if (file.endsWith(".js")) {
                    const source = require(path.join(folderPath, file)).default;
                    if (!source) return;
                    this.add(source);
                }
            });
        });
    }
    public isLinkMatch(url: string, source: string): boolean {
        let isMatch = false;
        Object.values(this.sources).forEach((source) => {
            if(source.isLinkMatch(url)) isMatch = true;
        })
        if (isMatch) return true;
    }
}