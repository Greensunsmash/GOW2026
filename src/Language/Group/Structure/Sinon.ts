import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Booleen } from "../../Booleen/Booleen";

export class Sinon extends Group implements Executable {
    private bool: Booleen; // Azy c'est bon y'aura pas d'erreur
    public done: boolean = false;
    private l1 : Executable[] = [];
    private l2 : Executable[] = [];

    constructor(e1: Executable | Executable[] | Booleen, e2: Executable | Executable[] | Booleen, boolOptional?: Booleen) {
        super();

        if (e1 instanceof Booleen) {this.bool = e1;} 
        else if (Array.isArray(e1)) {this.l1 = [...e1];} 
        else {this.l1 = [e1];}

        if (e2 instanceof Booleen) {this.bool = e2;} 
        else if (Array.isArray(e2)) {this.l2 = [...e2];} 
        else {this.l2 = [e2];} 

        if (boolOptional) this.bool = boolOptional;
    }

    public execute(): void {
        this.done = false;
        if (this.bool.eval()) {this.list = this.l1; this.next();}
        else {this.list = this.l2; this.next();};
    }

    onLaunch(l: Launchable): boolean {
        if (this.bool.onLaunch(l)) return super.onLaunch(l);
        return false;
    }

    
}