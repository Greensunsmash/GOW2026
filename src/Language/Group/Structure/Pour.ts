import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Valeur } from "../../Valeur/Valeur";

export class Pour extends Group implements Executable {
    private valeur: Valeur;

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

    execute(): void {
        const val = this.valeur.eval();
        if (val.getType() === "INT") {
            const nb = val.getValue() as number;
            for (let i = 0; i < nb; i++) {
                super.execute();
            }
        }
        else console.log("oups");
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur.onLaunch(l)) return super.onLaunch(l);
        return false;
    }
}
