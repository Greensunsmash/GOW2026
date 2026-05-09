import type { DepartContainer } from "../../Containers/DepartContainer";
import type { StructureContainer } from "../../Containers/StructureContainer";
import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";

export abstract class Group extends Bloc {
    protected list: Executable[];
    protected container: StructureContainer | DepartContainer;
    protected next_inst: number[];
    public back_listeners : (() => void)[] = [];
    public next_listeners : (() => void)[] = [];

    constructor(eOrList?: Executable | Executable[]) {
        super();
        if (!eOrList) this.list = [];
        else if (Array.isArray(eOrList)) this.list = [...eOrList];
        else this.list = [eOrList];
        this.next_inst = [];

        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
    }

    public execute(): void{
        this.next_inst.push(0);
        this.next();
    }
    
    public next(): void {
        if (this.list.length === 0) // Groupes vides (sinon => crash)
            return this.jump_next();
        
        const i = this.next_inst.length - 1;
        const prev = this.list[(this.next_inst[i] - 1 >= 0) ? this.next_inst[i] - 1 : this.list.length -1];
        const idx = prev.next_listeners.indexOf(this.next);
        const idx2 = prev.back_listeners.indexOf(this.back);
        if (idx !== -1) prev.next_listeners.splice(idx, 1);
        if (idx2 !== -1) prev.back_listeners.splice(idx, 1);

        if (this.next_inst[i] < this.list.length) {
            this.list[this.next_inst[i]].next_listeners.push(this.next);
            this.list[this.next_inst[i]].back_listeners.push(this.back);
            this.next_inst[i] += 1;
            this.list[this.next_inst[i]-1].execute();
        } else {
            this.jump_next();
        }
    }

    public back():void {
        if (this.list.length === 0)
            return this.jump_back();
        const i = this.next_inst.length - 1;
        this.next_inst[i] -= 1;
        const prev = this.list[(this.next_inst[i] >=0) ? this.next_inst[i] : this.list.length -1];
        const idx = prev.next_listeners.indexOf(this.next);
        const idx2 = prev.back_listeners.indexOf(this.back);
        if (idx !== -1) prev.next_listeners.splice(idx, 1);
        if (idx2 !== -1) prev.back_listeners.splice(idx, 1);

        if (this.next_inst[i] > 0) {
            this.list[this.next_inst[i]-1].next_listeners.push(this.next);
            this.list[this.next_inst[i]-1].back_listeners.push(this.back);
            Memory.get().setCurrentInstruction(this.list[this.next_inst[i]-1].getBaseInstruction());
        } else {
            this.jump_back();
        }
    }

    // Utilisé pour sortir du groupe
    protected jump_next():void {for (const listener of this.next_listeners) listener();}
    protected jump_back():void {this.next_inst.pop(); for (const listener of this.back_listeners) listener();}

    onLaunch(l: Launchable): boolean {
        for (const e of this.list) {
            if (e instanceof Bloc && !e.onLaunch(l)) {
                return false;
            }
        }
        return true;
    }
    getBaseInstruction():Executable{
        const i = this.next_inst.length - 1;
        console.log(this.list, i, this.next_inst);
        if (this.list[this.next_inst[i]-1].back_listeners.length === 0 && this.list[this.next_inst[i]-1].next_listeners.length === 0) {
            this.list[this.next_inst[i]-1].next_listeners.push(this.next);
            this.list[this.next_inst[i]-1].back_listeners.push(this.back);
        }
        return this.list[this.next_inst[i]-1].getBaseInstruction();
    }
    
    public getContainer() : StructureContainer | DepartContainer {return this.container;}
}
