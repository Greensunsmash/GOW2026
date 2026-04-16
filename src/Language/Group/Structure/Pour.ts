import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Valeur } from "../../Valeur/Valeur";

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
        //console.log("Boucle : passage ", this.loop_nb, "| ", this.max_loop_nb, " | next_inst ", this.next_inst);
        if (this.next_inst >= this.list.length && this.loop_nb < this.max_loop_nb) {this.loop_nb += 1; this.next_inst = 0;}
        super.next();
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur.onLaunch(l)) return super.onLaunch(l);
        return false;
    }
}
