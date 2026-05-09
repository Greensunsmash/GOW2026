import { Group } from "../Group";
import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Value } from "../../Valeur/Value";
import { Bloc } from "../../Bloc";
import { Memory } from "../../Memory";
import type { DepartContainer } from "../../../Containers/DepartContainer";

export class Flag extends Group implements Launchable {
    private memory : Memory;
    constructor(container:DepartContainer, e?: Executable | Executable[]) {
        if (!e) {
            super();
        } else if (Array.isArray(e)) {
            super(e);
        } else {
            super(e);
        }
        this.memory = Memory.get();
        this.container = container;
    }

    public execute(_list?: Value[]): void {
        super.execute();
        //console.log(Memory.get().getHistory());
    }

    public next():void {
        //console.log("next ", this.next_inst);
        const i = this.next_inst.length -1;
        if (this.next_inst[i] >= this.list.length) {this.memory.programEnd(); this.memory.setCurrentInstruction(this.getBaseInstruction());}
        else super.next();
    }

    public back():void {
        const i = this.next_inst.length -1;
        //console.log("back ", this.next_inst);
        super.back();
        if (this.next_inst[i] <= 0) {this.memory.resetCurrentInstruction(); console.log("On est de retour au début");}
    }

    onLaunch(): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(this)) return false;
        }
        return true;
    }
}
