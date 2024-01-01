import fs from "fs";
import path from "path";

type Data = Record<string, any>;

export class MoonlinkDatabase {
    private data: Data = {};
    private id: string;

    constructor(clientId: string) {
        this.fetch();
        this.id = clientId;
    }

    set<T>(key: string, value: T): void {
        if (!key) throw new Error('@Moonlink(Database) - "key" is empty');

        const keys: string[] = key.split(".");
        if (keys.length === 0) return;

        this.updateData(this.data, keys, value);
        this.save();
    }

    get<T>(key: string): T | undefined {
        if (!key) throw new Error('[ @Moonlink(Database) - "key" is empty');

        return key.split(".").reduce((acc, curr) => acc?.[curr], this.data);
    }

    push<T>(key: string, value: T): void {
        if (!key) throw new Error('@Moonlink(Database) - "key" is empty');

        const oldArray = this.get<T[]>(key) || [];
        if (Array.isArray(oldArray)) {
            oldArray.push(value);
            this.set(key, oldArray);
        } else {
            throw new Error(
                "@Moonlink(Database) - Key does not point to an array"
            );
        }
    }

    delete(key: string): boolean {
        if (!key) throw new Error('@Moonlink(Database) - "key" is empty');

        const keys: string[] = key.split(".");
        if (keys.length === 0) return false;

        const lastKey: string = keys.pop() || "";
        let currentObj: Data = this.data;

        keys.forEach(k => {
            if (typeof currentObj[k] === "object") {
                currentObj = currentObj[k];
            } else {
                throw new Error(
                    `@Moonlink(Database) - Key path "${key}" does not exist`
                );
            }
        });

        if (currentObj && lastKey in currentObj) {
            delete currentObj[lastKey];
            this.save();
            return true;
        }
        return false;
    }

    private updateData(data: Data, keys: string[], value: any): void {
        let currentObj: Data = data;

        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                currentObj[key] = value;
            } else {
                if (typeof currentObj[key] !== "object") {
                    currentObj[key] = {};
                }
                currentObj = currentObj[key];
            }
        });
    }

    private getFilePath() {
        return path.join(
            __dirname,
            "../@Datastore",
            `database-${this.id}.json`
        );
    }

    private fetch() {
        try {
            const directory = path.join(__dirname, "../@Datastore");
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            const filePath = this.getFilePath();

            const rawData = fs.readFileSync(filePath, "utf-8");
            this.data = JSON.parse(rawData) || {};
        } catch (err) {
            if (err.code === "ENOENT") {
                this.data = {};
            } else {
                throw new Error("@Moonlink(Database) - Failed to fetch data");
            }
        }
    }

    private save() {
        try {
            const filePath = this.getFilePath();
            fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            throw new Error("@Moonlink(Database) - Failed to save data");
        }
    }
}
