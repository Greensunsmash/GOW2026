import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";

export abstract class Instruction extends Bloc implements Executable {
    public back_listeners : (() => void)[] = [];
    public next_listeners : (() => void)[] = [];
    abstract execute(): void;
    public back(){
        for (const listener of this.back_listeners) listener();
    }
    public next(){
        for (const listener of this.next_listeners) listener();
    }
}
