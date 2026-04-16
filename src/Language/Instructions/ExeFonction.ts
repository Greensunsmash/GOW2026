import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Value } from "../Valeur/Value";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Bloc } from "../Bloc";

export class ExeFonction extends Instruction {
    private name: string;
    private list: Valeur[];
    private listener : () => void;

    constructor(name: string) {
        super();
        this.name = name;
        this.list = [];
        this.listener = () => {};
    }

    async execute() {
        const func = Memory.get().getFonction(this.name);
        if (!func) return;
        this.listener = () => {this.next(); func.next_listeners.splice(func.next_listeners.indexOf(this.getListener()), 1)}; // Appele le next, puis se supprime des listener
        func.next_listeners.push(this.listener);
        if (this.list.length > 0) {
            const l: Value[] = this.list.map(v => v.eval());
            func.execute(l);
        } else {
            func.execute();
        }

        Memory.get().setCurrentInstruction(this);
    }

    addArgs(valeur: Valeur): void {this.list.push(valeur);}

    onLaunch(l: Launchable): boolean {
        for (const v of this.list) {
            if (v instanceof Bloc && !v.onLaunch(l)) {
                return false;
            }
        }
        return true;
    }

    // GETTERS
    private getListener():()=>void {return this.listener;}
}
