import { IExtendable } from '../typings/Interfaces'
import { 
    Manager, 
    PlayerManager,
    NodeManager,
    Node, 
    Player,
    Rest, 
    Queue, 
    Track
 } from '../../index'

const structures: IExtendable = {
    PlayerManager,
    NodeManager,
    Node,
    Player,
    Rest,
    Queue,
    Track
}
// TODO - A Classe pode trazer problemas com multiplas aplicações, por exemplo, se tiver duas aplicações em um ambiente pode dá um replace no manager, deixando apenas uma aplicação funcional
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