import type { Executable } from "../../Executable";
import type { Launchable } from "../../Launchable";
import { Group } from "../Group";
import { Booleen } from "../../Booleen/Booleen";

export class Si extends Group implements Executable {
    private bool: Booleen;
    public done: boolean = false;

    constructor(e: Executable | Executable[] | Booleen, boolOptional?: Booleen) {
        if (e instanceof Booleen) {
            super();
            this.bool = e;
        } else if (Array.isArray(e)) {
            super(e);
            this.bool = boolOptional!;
        } else {
            super(e);
            this.bool = boolOptional!;
        }
    }

    public execute(): void {
        this.done = false;
        if (this.bool.eval()) {this.done = true; this.next();}
        else this.jump_next();
        }

    public back(): void {
        if (this.done) super.back();
        else this.jump_back();
    }

    onLaunch(l: Launchable): boolean {
        if (this.bool.onLaunch(l)) return super.onLaunch(l);
        return false;
    }

    getBaseInstruction():Executable{
        if (!this.done) return this;
        else return super.getBaseInstruction();
    }
}
