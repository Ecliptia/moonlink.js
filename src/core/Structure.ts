import { Manager, Node, Player, Rest } from '../../index'
import { IExtendable } from '../typings/Interfaces'

const structures: IExtendable = {
    Node: Node,
    Rest: Rest,
    Player: Player,
};
export abstract class Structure {
    public static manager: Manager;
    public initialize(manager: Manager) {
        Structure.manager = manager;
    }
    public static extend <K extends keyof IExtendable, T extends IExtendable[K]> (name: K, extender: (target: IExtendable[K]) => T) {
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }
    public static get <K extends keyof IExtendable> (name: K): IExtendable[K] {
        return structures[name];
    }
    public static setManager(manager: Manager) {
        Structure.manager = manager;
    }
    public static getManager(): Manager {      
        return Structure.manager;
    }
}