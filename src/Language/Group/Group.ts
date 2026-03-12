import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";
import type { Launchable } from "../Launchable";

export abstract class Group extends Bloc {
    protected list: Executable[];

    constructor(eOrList?: Executable | Executable[]) {
        super();
        if (!eOrList) this.list = [];
        else if (Array.isArray(eOrList)) this.list = [...eOrList];
        else this.list = [eOrList];
    }

    async execute(): Promise<void> {
        for (const e of this.list) {
            await e.execute();
        }
    }

    onLaunch(l: Launchable): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(l)) {
                return false;
            }
        }
        return true;
    }
}
