import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Value } from "../Valeur/Value";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";

export class ExeFonction extends Instruction {
    private name: string;
    private list: Valeur[];

    constructor(name: string) {
        super();
        this.name = name;
        this.list = [];
        
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
    }

    async execute() {
        const func = Memory.get().getFonction(this.name);
        if (!func) return;
        func.next_listeners.push(this.next);
        func.back_listeners.push(this.back);
        if (this.list.length > 0) {
            const l: Value[] = this.list.map(v => v.eval());
            func.execute(l);
        } else {
            func.execute();
        }
    }

    public next(): void {
        const func = Memory.get().getFonction(this.name);
        if (!func) return;
        const idx = func.next_listeners.indexOf(this.next);
        const idx2 = func.back_listeners.indexOf(this.back);
        if (idx !== -1) func.next_listeners.splice(idx, 1);
        if (idx2 !== -1) func.back_listeners.splice(idx, 1);
        super.next()
    }
    public back():void {
        const func = Memory.get().getFonction(this.name);
        if (!func) return;
        const idx = func.next_listeners.indexOf(this.next);
        const idx2 = func.back_listeners.indexOf(this.back);
        if (idx !== -1) func.next_listeners.splice(idx, 1);
        if (idx2 !== -1) func.back_listeners.splice(idx, 1);
        super.back();
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
    getBaseInstruction(): Executable{
        const func = Memory.get().getFonction(this.name);
        if (!func) throw new Error("BOUM");
        if (func.back_listeners.length === 0 && func.next_listeners.length === 0) {
            func.next_listeners.push(this.next);
            func.back_listeners.push(this.back);
        }
        return func.getBaseInstruction();}
    }
