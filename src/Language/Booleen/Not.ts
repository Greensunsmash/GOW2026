import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class Not extends Booleen {
    private b: Booleen;

    constructor(b: Booleen) {
        super();
        this.b = b;
    }

    eval(): boolean {return !this.b.eval();}

    onLaunch(l: Launchable): boolean {return this.b.onLaunch(l);}
    
}
