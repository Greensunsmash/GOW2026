import { Booleen } from "./Booleen";
import { Valeur } from "../Valeur/Valeur";
import type { Launchable } from "../Launchable";
import type { BlocContainer } from "../../Containers/BlocContainer";

export class Egal extends Booleen {
    private v1: Valeur;
    private v2: Valeur;

    constructor(v1: Valeur, v2: Valeur, container:BlocContainer) {
        super();
        this.v1 = v1;
        this.v2 = v2;
        this.container = container;
    }

    eval(): boolean {return this.v1.eval().equalsTo(this.v2.eval());}

    onLaunch(l: Launchable): boolean {return this.v1.onLaunch(l) && this.v2.onLaunch(l);}
    
}
