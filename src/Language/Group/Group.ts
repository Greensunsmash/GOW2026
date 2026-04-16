import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";
import type { Launchable } from "../Launchable";

export abstract class Group extends Bloc {
    protected list: Executable[];
    protected next_inst: number;
    public back_listeners : (() => void)[] = [];
    public next_listeners : (() => void)[] = [];

    constructor(eOrList?: Executable | Executable[]) {
        super();
        if (!eOrList) this.list = [];
        else if (Array.isArray(eOrList)) this.list = [...eOrList];
        else this.list = [eOrList];
        this.next_inst = 0;

        this.next = this.next.bind(this);
    }

    public execute(): void{
        this.next_inst = 0;
        this.next();
    }

    public next(): void {
        const prev = this.list[(this.next_inst - 1 >= 0) ? this.next_inst - 1 : this.list.length -1];
        const idx = prev.next_listeners.indexOf(this.next);
        if (idx !== -1) {
            prev.next_listeners.splice(idx, 1);
        }

        if (this.next_inst < this.list.length) {
            this.list[this.next_inst].next_listeners.push(this.next);
            this.next_inst += 1;
            this.list[this.next_inst-1].execute();
        } else {
            this.jump_next();
        }
    }
    public back():void {};

    // Utilisé pour sortir du groupe
    protected jump_next():void {for (const listener of this.next_listeners) listener();}

    onLaunch(l: Launchable): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(l)) {
                return false;
            }
        }
        return true;
    }
}
