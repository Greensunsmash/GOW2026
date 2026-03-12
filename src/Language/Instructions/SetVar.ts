import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Booleen } from "../Booleen/Booleen";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";

export class SetVar extends Instruction {
    private name: string;
    private valeur?: Valeur;
    private bool?: Booleen;

    constructor(name: string, arg: Valeur | Booleen) {
        super();
        this.name = name;
        if (arg instanceof Valeur) {
            this.valeur = arg;
        } else {
            this.bool = arg;
        }
    }

    async execute(): Promise<void> {
        if (this.valeur) {Memory.get().setVariable(this.name, this.valeur.eval());}
        if (this.bool) {Memory.get().setVariable(this.name, this.bool.eval());}
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur) return this.valeur.onLaunch(l);
        if (this.bool) return this.bool.onLaunch(l);
        return false;
    }
}
