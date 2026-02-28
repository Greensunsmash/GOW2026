import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Instruction } from "../../Language/Instructions/Instruction";
import type { ValeurContainer } from "../ValeurContainer";
import { SetVar } from "../../Language/Instructions/SetVar";

export class SetVarContainer extends InstructionContainer {
    
    name:string;

    constructor(name:string, root: GUI.Container, scene: GameScene){
        super(["On met la valeur de " + name + " à ", "a"], root, scene);
        this.name = name;
    }

    getInstruction(): Instruction {
        let slots = this.getSlots();
        let value = slots[0].children[0] as ValeurContainer;
        return new SetVar(this.name, value.getValue()[0]);
    }

}