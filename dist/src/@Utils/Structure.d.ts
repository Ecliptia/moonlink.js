import { Extendable } from "../@Typings";
import { MoonlinkManager, MoonlinkDatabase } from "../../index";
export declare abstract class Structure {
    static manager: MoonlinkManager;
    static db: MoonlinkDatabase;
    static extend<K extends keyof Extendable, T extends Extendable[K]>(name: K, extender: (target: Extendable[K]) => T): T;
    static init(manager: MoonlinkManager): void;
    static get<K extends keyof Extendable>(name: K): Extendable[K];
}
export declare class Plugin {
    load(manager: MoonlinkManager): void;
}
