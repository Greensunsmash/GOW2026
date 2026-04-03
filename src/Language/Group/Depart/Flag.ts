import { Group } from "../Group";
import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Value } from "../../Valeur/Value";
import { Bloc } from "../../Bloc";
import { Memory } from "../../Memory";

export class Flag extends Group implements Launchable {
    
    constructor(e?: Executable | Executable[]) {
        if (!e) {
            super();
        } else if (Array.isArray(e)) {
            super(e);
        } else {
            super(e);
        }
    }

    async execute(_list?: Value[]): Promise<void> {
        await super.execute();
        console.log(Memory.get().getHistory());
    }

    onLaunch(): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(this)) return false;
        }
        return true;
    }
}
