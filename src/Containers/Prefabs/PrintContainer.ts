import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Instruction } from "../../Language/Instructions/Instruction";
import { Print } from "../../Language/Instructions/Print";
import type { ValeurContainer } from "../ValeurContainer";

export class PrintContainer extends InstructionContainer {

    // Rajouter un InputText. En attendant on va faire comme ça
    // C'est inacceptable.
    constructor(root: GUI.Container, scene: GameScene){
        super(["Afficher ", "a"], root, scene);
    }

    getInstruction(): Instruction {
        let slots = this.getSlots();
        let value = slots[0].children[0] as ValeurContainer;
        return new Print(value.getValue()[0]);
    }

}