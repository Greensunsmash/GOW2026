import type { BlocContainer } from "../../Containers/BlocContainer";
import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class Not extends Booleen {
    private b: Booleen;

    constructor(b: Booleen, container:BlocContainer) {
        super();
        this.b = b;
        this.container = container;
    }

    eval(): boolean {return !this.b.eval();}

    onLaunch(l: Launchable): boolean {return this.b.onLaunch(l);}
    
}
