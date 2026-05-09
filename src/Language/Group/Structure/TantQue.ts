import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Memory } from "../../Memory";
import { Booleen } from "../../Booleen/Booleen";
import type { StructureContainer } from "../../../Containers/StructureContainer";

export class TantQue extends Group implements Executable {
    private bool : Booleen;
    public loop_nb : number[] = [];

    constructor(e: Executable | Executable[] | Booleen, container:StructureContainer, boolOptional?: Booleen) {
        if (e instanceof Booleen) {
            super();
            this.bool = e;
        } else if (Array.isArray(e)) {
            super(e);
            this.bool = boolOptional!;
        } else {
            super(e);
            this.bool = boolOptional!;
        }
        this.container = container;
    }

    public execute(): void { // Vérifiez pour une condition fausse dès le départ
        const b = this.bool.eval();
        this.loop_nb.push(0)
        this.next_inst.push(0);
        if (b) {
            this.loop_nb[this.loop_nb.length -1] += 1;
            this.next();
        }
        else this.jump_next();
    }

    public next(): void {
        const i = this.next_inst.length - 1;
        if (this.next_inst[i] >= this.list.length && this.bool.eval()) {
            this.loop_nb[i] += 1; 
            this.next_inst[i] = 0;
        }
        super.next();
    }

    public back(): void {
        const i = this.next_inst.length - 1;
        this.next_inst[i] -= 1;
        //console.log("back", this.next_inst, " ", this.loop_nb);
        const prev = this.list[(this.next_inst[i] >=0) ? this.next_inst[i] : this.list.length -1];
        const idx = prev.next_listeners.indexOf(this.next);
        const idx2 = prev.back_listeners.indexOf(this.back);
        if (idx !== -1) prev.next_listeners.splice(idx, 1);
        if (idx2 !== -1) prev.back_listeners.splice(idx, 1);

        if (this.next_inst[i] <= 0 && this.loop_nb[i] > 1) {this.next_inst[i] = this.list.length; this.loop_nb[i] -=1;}
        if (this.next_inst[i] > 0) Memory.get().setCurrentInstruction(this.getBaseInstruction());
        else if (this.loop_nb[i] <= 1) this.jump_back();
        
    }

    protected jump_back():void {this.loop_nb.pop(); super.jump_back();}

    onLaunch(l: Launchable): boolean {
        if (this.bool.onLaunch(l)) return super.onLaunch(l);
        return false;
    }

    getBaseInstruction():Executable{
        if (this.loop_nb[this.next_inst.length - 1] == 0) return this;
        else return super.getBaseInstruction();
    }
}
