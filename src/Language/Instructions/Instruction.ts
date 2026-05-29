import type { InstructionContainer } from "../../Containers/InstructionContainer";
import { SoundManager } from "../../Shared/Sounds";
import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";
import type { GameMode } from "../Memory";

export abstract class Instruction extends Bloc implements Executable {
    protected container : InstructionContainer;
    protected gameModeAtExecute?: GameMode;
    public back_listeners : (() => void)[] = [];
    public next_listeners : (() => void)[] = [];
    abstract execute(): void;
    public back(){for (const listener of this.back_listeners) listener();}
    public next(){SoundManager.playSound("tick.ogg", 0.2); for (const listener of this.next_listeners) listener();}
    public getBaseInstruction(): Executable {return this;}
    public reset(){this.back_listeners = []; this.next_listeners = [];}
    public getContainer() : InstructionContainer {return this.container;}
    public setContainer(inst:InstructionContainer) {this.container = inst;}
    
}
