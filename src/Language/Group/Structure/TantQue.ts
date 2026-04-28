import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Memory } from "../../Memory";
import { Booleen } from "../../Booleen/Booleen";

export class TantQue extends Group implements Executable {
    private bool : Booleen;
    public loop_nb : number = 0;

    constructor(e: Executable | Executable[] | Booleen, boolOptional?: Booleen) {
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
    }

    public execute(): void {
        const b = this.bool.eval();
        if (b) {
            this.loop_nb = 1;
            this.next();
        }
        else console.log("oups");
    }

    public next(): void {
        if (this.next_inst >= this.list.length && this.bool.eval()) {
            this.loop_nb += 1; 
            this.next_inst = 0;
        }
        super.next();
    }

    public back(): void {
        this.next_inst -= 1;
        //console.log("back", this.next_inst, " ", this.loop_nb);
        const prev = this.list[(this.next_inst >=0) ? this.next_inst : this.list.length -1];
        const idx = prev.next_listeners.indexOf(this.next);
        const idx2 = prev.back_listeners.indexOf(this.back);
        if (idx !== -1) prev.next_listeners.splice(idx, 1);
        if (idx2 !== -1) prev.back_listeners.splice(idx, 1);

        if (this.next_inst <= 0 && this.loop_nb > 1) {this.next_inst = this.list.length; this.loop_nb -=1;}
        if (this.next_inst > 0) Memory.get().setCurrentInstruction(this.getBaseInstruction());
        else if (this.loop_nb <= 1) this.jump_back();
        
    }

    onLaunch(l: Launchable): boolean {
        if (this.bool.onLaunch(l)) return super.onLaunch(l);
        return false;
    }

    getBaseInstruction():Executable{
        if (this.loop_nb == 0) return this;
        else return super.getBaseInstruction();
    }
}
