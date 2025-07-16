import { Manager } from "../../index";
import { AbstractDatabase } from "./AbstractDatabase";

let mongoose: any;
let KeyValueModel: any;

export class MongooseDB extends AbstractDatabase {
  private manager: Manager;

  public async init(manager: Manager): Promise<void> {
    this.manager = manager;
    try {
      mongoose = require('mongoose');
    } catch (error) {
      this.manager.emit("debug", "Moonlink.js > MongooseDB > Mongoose is not installed. Please install it using: npm install mongoose");
      throw new Error("Mongoose is not installed. Please install it using: npm install mongoose");
    }

    const connectionString = this.manager.options.database?.options?.mongoose?.connectionString;
    if (!connectionString) {
      throw new Error("Mongoose connection string is not provided in database.options.mongoose.connectionString");
    }

    try {
      await mongoose.connect(connectionString);
      this.manager.emit("debug", "Moonlink.js > MongooseDB > Connected to MongoDB");

      const KeyValueSchema = new mongoose.Schema({
        key: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
      });

      KeyValueModel = mongoose.models.KeyValue || mongoose.model('KeyValue', KeyValueSchema);

    } catch (error: any) {
      this.manager.emit("debug", `Moonlink.js > MongooseDB > Failed to connect to MongoDB: ${error.message}`);
      throw error;
    }
  }

  public async set(key: string, value: any): Promise<void> {
    const parts = key.split('.');
    const docKey = parts[0];
    const nestedPath = parts.slice(1).join('.');

    let existingDoc = await KeyValueModel.findOne({ key: docKey });
    let currentData = existingDoc ? existingDoc.value : {};

    let target = currentData;
    if (nestedPath) {
        const nestedParts = nestedPath.split('.');
        for (let i = 0; i < nestedParts.length - 1; i++) {
            const part = nestedParts[i];
            if (typeof target[part] !== 'object' || target[part] === null) {
                target[part] = {};
            }
            target = target[part];
        }
        const lastPart = nestedParts[nestedParts.length - 1];
        if (typeof target[lastPart] === 'object' && target[lastPart] !== null && !Array.isArray(target[lastPart]) &&
            typeof value === 'object' && value !== null && !Array.isArray(value)) {
            target[lastPart] = { ...target[lastPart], ...value };
        } else {
            target[lastPart] = value;
        }
    } else {
        if (typeof currentData === 'object' && currentData !== null && !Array.isArray(currentData) &&
            typeof value === 'object' && value !== null && !Array.isArray(value)) {
            currentData = { ...currentData, ...value };
        } else {
            currentData = value;
        }
    }

    await KeyValueModel.findOneAndUpdate(
        { key: docKey },
        { $set: { value: currentData } },
        { upsert: true, new: true }
    );
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const parts = key.split('.');
    const docKey = parts[0];
    const nestedPath = parts.slice(1).join('.');

    const doc = await KeyValueModel.findOne({ key: docKey });
    if (!doc || !doc.value) return undefined;

    let value = doc.value;
    if (nestedPath) {
        const nestedParts = nestedPath.split('.');
        for (const part of nestedParts) {
            if (typeof value !== 'object' || value === null) {
                return undefined;
            }
            value = value[part];
        }
    }
    return value as T;
  }

  public async remove(key: string): Promise<boolean> {
    const parts = key.split('.');
    const docKey = parts[0];
    const nestedPath = parts.slice(1).join('.');

    if (!nestedPath) {
        const result = await KeyValueModel.deleteOne({ key: docKey });
        return result.deletedCount > 0;
    }

    let existingDoc = await KeyValueModel.findOne({ key: docKey });
    if (!existingDoc || !existingDoc.value) return false;

    let currentData = existingDoc.value;
    let target = currentData;
    const nestedParts = nestedPath.split('.');

    for (let i = 0; i < nestedParts.length - 1; i++) {
        const part = nestedParts[i];
        if (typeof target[part] !== 'object' || target[part] === null) {
            return false;
        }
        target = target[part];
    }

    const lastPart = nestedParts[nestedParts.length - 1];
    const existed = typeof target === 'object' && target !== null && Object.prototype.hasOwnProperty.call(target, lastPart);

    if (existed) {
        delete target[lastPart];
        await KeyValueModel.findOneAndUpdate(
            { key: docKey },
            { $set: { value: currentData } },
            { new: true }
        );
    }
    return existed;
  }

  public async has(key: string): Promise<boolean> {
    const parts = key.split('.');
    const docKey = parts[0];
    const nestedPath = parts.slice(1).join('.');

    const doc = await KeyValueModel.findOne({ key: docKey });
    if (!doc || !doc.value) return false;

    let value = doc.value;
    if (nestedPath) {
        const nestedParts = nestedPath.split('.');
        for (const part of nestedParts) {
            if (typeof value !== 'object' || value === null) {
                return false;
            }
            value = value[part];
        }
    }
    return value !== undefined;
  }

  public async keys(): Promise<string[]> {
    const docs = await KeyValueModel.find({}).select('key');
    return docs.map((doc: any) => doc.key);
  }

  public async clear(): Promise<void> {
    await KeyValueModel.deleteMany({});
  }

  public async shutdown(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      this.manager.emit("debug", "Moonlink.js > MongooseDB > Disconnected from MongoDB");
    }
  }
}