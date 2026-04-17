import { Group } from "../Group";
import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Memory } from "../../Memory";
import type { StackFrame } from "../../Memory";
import { Value } from "../../Valeur/Value";
import { Bloc } from "../../Bloc";

export class Fonction extends Group implements Launchable {
    private name: string;
    private args?: string[];
    private stack_list: StackFrame[];

    constructor(name: string, eOrList?: Executable | Executable[]) {
        if (!eOrList) {
            super();
        } else if (Array.isArray(eOrList)) {
            super(eOrList);
        } else {
            super(eOrList);
        }
        this.name = name;
        this.stack_list = [];
    }

    public execute(list?: Value[]): void {
        const map: Map<string, Value> = new Map();
        if (list && this.args) {
            for (let i = 0; i < Math.min(this.args.length, list.length); i++) {
                map.set(this.args[i], list[i]);
            }
        }
        Memory.get().newFonctionCall(this.name, map);
        super.execute();
    }

    protected jump_next(): void {
        this.stack_list.push(Memory.get().endFonction(this.name));
        super.jump_next();
    }

    protected jump_back() :void {
        Memory.get().endFonction(this.name);
        super.jump_back();
    }
    
    onLaunch(): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(this)) return false;
        }
        Memory.get().setFonction(this.name, this);
        return true;
    }

    addArgs(name: string): void {
        if (!this.args) this.args = [];
        this.args.push(name);
    }

    getArgs(): string[] | undefined {
        return this.args;
    }

    getName(): string {
        return this.name;
    }

    getBaseInstruction():Executable{
        Memory.get().stackComeback(this.stack_list.pop());
        return super.getBaseInstruction();
    }

}
