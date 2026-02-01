import { Value } from "./Value";
import { Valeur } from "./Valeur";
import type { Launchable } from "../Launchable";

export class Moins extends Valeur {
    private v1: Valeur;
    private v2: Valeur;

    constructor(v1: Valeur, v2: Valeur) {
        super();
        this.v1 = v1;
        this.v2 = v2;
    }

    eval(): Value {
        const value1 = this.v1.eval();
        const value2 = this.v2.eval();
        return value1.substract(value2);
    }

    onLaunch(l: Launchable): boolean {
        return this.v1.onLaunch(l) && this.v2.onLaunch(l);
    }
}
