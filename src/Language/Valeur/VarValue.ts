import { Valeur } from "./Valeur";
import { Value } from "./Value";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Fonction } from "../Group/Depart/Fonction";

export class VarValue extends Valeur {
    private name: string;
    private funcName?: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    onLaunch(l: Launchable): boolean {
        // Détecte si l'objet lancé est une fonction
        if (l instanceof Fonction) {
            this.funcName = l.getName();
        }
        return super.onLaunch(l);
    }

    eval(): Value {
        if (this.funcName) {
            return Memory.get().getVariableValue(this.name, this.funcName);
        }
        return Memory.get().getVariableValue(this.name);
    }
}
