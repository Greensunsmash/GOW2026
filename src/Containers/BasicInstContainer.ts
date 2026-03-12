import type { Instruction } from "../Language/Instructions/Instruction";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { InstructionContainer } from "./InstructionContainer";
import * as GUI from "@babylonjs/gui";

export class BasicInstContainer extends InstructionContainer {
    private instruction: Instruction;

    constructor(name: string, inst: Instruction, root: GUI.Container, scene: GameScene){
        super([name], root, scene);
        this.instruction = inst;
    }

    getInstruction(): Instruction {
        return this.instruction;
    }
}
