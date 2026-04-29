import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Valeur } from "../../Valeur/Valeur";
import { Memory } from "../../Memory";

export class Pour extends Group implements Executable {
    private valeur: Valeur;
    private loop_nb : number = 0;
    private max_loop_nb : number = 0;

    constructor(e: Executable | Executable[] | Valeur, valeurOptional?: Valeur) {
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
    }

    public execute(): void {
        const val = this.valeur.eval();
        if (val.getType() === "INT") {
            this.max_loop_nb = val.getValue() as number;
            this.loop_nb = 1;
            this.next();
        }
        else console.log("oups");
    }

    public next(): void {
        if (this.next_inst >= this.list.length && this.loop_nb < this.max_loop_nb) {this.loop_nb += 1; this.next_inst = 0;}
        console.log("Boucle : passage ", this.loop_nb, "| ", this.max_loop_nb, " | next_inst ", this.next_inst, " / ", this.list.length);
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
        if (this.valeur.onLaunch(l)) return super.onLaunch(l);
        return false;
    }
}
