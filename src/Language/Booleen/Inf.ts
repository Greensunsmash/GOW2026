import { Booleen } from "./Booleen";
import { Valeur } from "../Valeur/Valeur";
import { Value } from "../Valeur/Value";
import type { Launchable } from "../Launchable";
import type { BlocContainer } from "../../Containers/BlocContainer";

export class Inf extends Booleen {
    private v1: Valeur;
    private v2: Valeur;

    constructor(v1: Valeur, v2: Valeur, container:BlocContainer) {
        super();
        this.v1 = v1;
        this.v2 = v2;
        this.container = container;
    }

    eval(): boolean {
        const value1: Value = this.v1.eval();
        const value2: Value = this.v2.eval();
        return value1.infTo(value2);
    }

    onLaunch(l: Launchable): boolean {return this.v1.onLaunch(l) && this.v2.onLaunch(l);}
}
