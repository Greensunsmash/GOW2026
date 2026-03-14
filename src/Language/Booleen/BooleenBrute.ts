import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class BooleenBrut extends Booleen {
    private bool: boolean;

    constructor(bool: boolean) {
        super();
        this.bool = bool;
    }

    eval(): boolean {return this.bool;}

    onLaunch(l: Launchable): boolean {return true;}
}
