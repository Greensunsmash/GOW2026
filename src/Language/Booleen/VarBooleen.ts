import { Booleen } from "./Booleen";
import { Memory } from "../Memory";

export class VarBooleen extends Booleen {
    private name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    eval(): boolean {
        const val = Memory.get().getVariableBoolean(this.name);
        return val;
    }
}
