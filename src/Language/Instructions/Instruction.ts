import type { InstructionContainer } from "../../Containers/InstructionContainer";
import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";

export abstract class Instruction extends Bloc implements Executable {
    protected container : InstructionContainer;
    public back_listeners : (() => void)[] = [];
    public next_listeners : (() => void)[] = [];
    abstract execute(): void;
    public back(){for (const listener of this.back_listeners) listener();}
    public next(){for (const listener of this.next_listeners) listener();}
    public getBaseInstruction(): Executable {return this;}
    public reset(){this.back_listeners = []; this.next_listeners = [];}
    public getContainer() : InstructionContainer {return this.container;}
    public setContainer(inst:InstructionContainer) {this.container = inst;}
    
}
