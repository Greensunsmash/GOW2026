import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class Et extends Booleen {
    private b1: Booleen;
    private b2: Booleen;

    constructor(b1: Booleen, b2: Booleen) {
        super();
        this.b1 = b1;
        this.b2 = b2;
    }

    eval(): boolean {return this.b1.eval() && this.b2.eval();}

    onLaunch(l: Launchable): boolean {return this.b1.onLaunch(l) && this.b2.onLaunch(l);}
    
}