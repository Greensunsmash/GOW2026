import type { Instruction } from "../Language/Instructions/Instruction";
import { Memory } from "../Language/Memory";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { InstructionContainer } from "./InstructionContainer";
import * as GUI from "@babylonjs/gui";

export class BasicInstContainer extends InstructionContainer {
    private instruction: Instruction;
    private pigModeInstruction?: Instruction;

    private initName: string;

    constructor(name: string, inst: Instruction, root: GUI.Container, content_root: GUI.Container, scene: GameScene, pigModeInst?: Instruction){
        super([name], root, content_root, scene);
        this.initName = name;
        this.instruction = inst;
        if (pigModeInst)
            this.pigModeInstruction = pigModeInst;
    }

    getInstruction(): Instruction {
        this.instruction.reset();
        this.pigModeInstruction?.reset();
        if (this.pigModeInstruction)
            return Memory.get().getGameMode() === "PIGMODE" ? this.pigModeInstruction : this.instruction;
        else
            return this.instruction;
    }

    triggerModeUpdate() {
        if (this.pigModeInstruction) {
            if (Memory.get().getGameMode() === "PIGMODE")
                this.bloc.updateFirstLabel("Avancer d'une case");
            else
                this.bloc.updateFirstLabel(this.initName);
        }
    }

    hasModeUpdateBehavior(): boolean {
        return !!this.pigModeInstruction;
    }
}
