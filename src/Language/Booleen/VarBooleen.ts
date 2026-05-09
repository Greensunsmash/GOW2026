import { Booleen } from "./Booleen";
import { Memory } from "../Memory";
import type { BlocContainer } from "../../Containers/BlocContainer";

export class VarBooleen extends Booleen {
    private name: string;

    constructor(name: string, container:BlocContainer) {
        super();
        this.name = name;
        this.container = container;
    }

    eval(): boolean {
        const val = Memory.get().getVariableBoolean(this.name);
        return val;
    }
}
