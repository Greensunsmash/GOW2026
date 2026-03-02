import { Group } from "../Group";
import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Memory } from "../../Memory";
import { Value } from "../../Valeur/Value";
import { Bloc } from "../../Bloc";

export class Fonction extends Group implements Launchable {
    private name: string;
    private args?: string[];

    constructor(name: string, eOrList?: Executable | Executable[]) {
        if (!eOrList) {
            super();
        } else if (Array.isArray(eOrList)) {
            super(eOrList);
        } else {
            super(eOrList);
        }
        this.name = name;
    }

    execute(list?: Value[]): void {
        const map: Map<string, Value> = new Map();
        if (list && this.args) {
            for (let i = 0; i < Math.min(this.args.length, list.length); i++) {
                map.set(this.args[i], list[i]);
            }
        }
        Memory.get().newFonctionCall(this.name, map);
        super.execute();
        Memory.get().endFonction(this.name);
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
}
