import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Valeur } from "../../Valeur/Valeur";
import { Memory } from "../../Memory";
import type { StructureContainer } from "../../../Containers/StructureContainer";

export class Pour extends Group implements Executable {
    private valeur: Valeur;
    private loop_nb : number[] = [];
    private max_loop_nb : number[] = [];

    constructor(e: Executable | Executable[] | Valeur, container:StructureContainer, valeurOptional?: Valeur) {
        if (e instanceof Valeur) {
            super();
            this.valeur = e;
        } else if (Array.isArray(e)) {
            super(e);
            this.valeur = valeurOptional!;
        } else {
            super(e);
            this.valeur = valeurOptional!;
        }
        this.container = container
    }

    public execute(): void {
        this.next_inst.push(0);
        console.log(this.valeur);
        const val = this.valeur.eval();
        if (val.getType() === "INT") {
            this.max_loop_nb.push(val.getValue() as number);
            this.loop_nb.push(1);
            if (this.max_loop_nb[this.max_loop_nb.length-1] == 0) this.jump_next();
            else this.next();
        }
        else console.log("oups");
    }

    public next(): void {
        const i = this.next_inst.length - 1;
        if (this.next_inst[i] >= this.list.length && this.loop_nb[i] < this.max_loop_nb[i]) {this.loop_nb[i] += 1; this.next_inst[i] = 0;}
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

    protected jump_back():void {this.max_loop_nb.pop(); this.loop_nb.pop(); super.jump_back();}

    onLaunch(l: Launchable): boolean {
        if (this.valeur.onLaunch(l)) return super.onLaunch(l);
        return false;
    }
}
