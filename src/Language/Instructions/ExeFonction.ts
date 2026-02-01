import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Value } from "../Valeur/Value";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Bloc } from "../Bloc";

export class ExeFonction extends Instruction {
    private name: string;
    private list: Valeur[];

    constructor(name: string) {
        super();
        this.name = name;
        this.list = [];
    }

    execute(): void {
        const func = Memory.get().getFonction(this.name);
        if (!func) return;

        if (this.list.length > 0) {
            const l: Value[] = this.list.map(v => v.eval());
            func.execute(l);
        } else {
            func.execute();
        }
    }

    addArgs(valeur: Valeur): void {
        this.list.push(valeur);
    }

    onLaunch(l: Launchable): boolean {
        for (const v of this.list) {
            if (v instanceof Bloc && !v.onLaunch(l)) {
                return false;
            }
        }
        return true;
    }
}
