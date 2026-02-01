import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Booleen } from "../Booleen/Booleen";
import type { Launchable } from "../Launchable";

export class Print extends Instruction {
    private valeur?: Valeur;
    private bool?: Booleen;

    constructor(arg: Valeur | Booleen) {
        super();
        if ("eval" in arg && typeof arg.eval === "function") {
            if ((arg as Valeur).eval && !(arg as Booleen).eval) {
                this.valeur = arg as Valeur;
            } else {
                this.bool = arg as Booleen;
            }
        }
    }

    execute(): void {
        if (this.valeur) {
            console.log(this.valeur.eval().getValue());
        }
        if (this.bool) {
            console.log(this.bool.eval());
        }
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur) {
            return this.valeur.onLaunch(l);
        }
        return true;
    }
}
