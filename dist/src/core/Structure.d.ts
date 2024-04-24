import { Manager } from '../../index';
import { IExtendable } from '../typings/Interfaces';
export declare abstract class Structure {
    static manager: Manager;
    initialize(manager: Manager): void;
    static extend<K extends keyof IExtendable, T extends IExtendable[K]>(name: K, extender: (target: IExtendable[K]) => T): T;
    static get<K extends keyof IExtendable>(name: K): IExtendable[K];
    static setManager(manager: Manager): void;
    static getManager(): Manager;
}
