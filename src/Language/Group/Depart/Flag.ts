import { Group } from "../Group";
import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Value } from "../../Valeur/Value";
import { Bloc } from "../../Bloc";
import { Memory } from "../../Memory";

export class Flag extends Group implements Launchable {
    private memory : Memory;
    constructor(e?: Executable | Executable[]) {
        if (!e) {
            super();
        } else if (Array.isArray(e)) {
            super(e);
        } else {
            super(e);
        }
        this.memory = Memory.get();
    }

    public execute(_list?: Value[]): void {
        super.execute();
        //console.log(Memory.get().getHistory());
    }

    public next():void {
        console.log("next ", this.next_inst);
        if (this.next_inst >= this.list.length) {this.memory.programEnd(); this.memory.setCurrentInstruction(this.getBaseInstruction());}
        else super.next();
    }

    public back():void {
        console.log("back ", this.next_inst);
        super.back();
        if (this.next_inst <= 0) {this.memory.resetCurrentInstruction(); console.log("On est de retour au début");}
    }

    onLaunch(): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(this)) return false;
        }
        return true;
    }
}
