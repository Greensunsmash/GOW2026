import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Booleen } from "../Booleen/Booleen";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";

export class Print extends Instruction {
    private valeur?: Valeur;
    private bool?: Booleen;

    constructor(arg: Valeur | Booleen) {
        super();
        if (arg instanceof Valeur) this.valeur = arg;
        if (arg instanceof Booleen) this.bool = arg;
    }

    async execute(): Promise<void> {
        if (this.valeur) console.log(this.valeur.eval().getValue());
        if (this.bool) console.log(this.bool.eval());
        Memory.get().setCurrentInstruction(this);
        
        if (Memory.get().isPlaying()) this.next();
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur) return this.valeur.onLaunch(l);
        if (this.bool) return this.bool.onLaunch(l);
        return true;
    }
}
