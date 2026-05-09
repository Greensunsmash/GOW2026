import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Instruction } from "../../Language/Instructions/Instruction";
import { Print } from "../../Language/Instructions/Print";
import type { ValeurContainer } from "../ValeurContainer";
import { isValuable } from "../Valuable";

export class PrintContainer extends InstructionContainer {

    // Rajouter un InputText. En attendant on va faire comme ça
    // C'est inacceptable.
    constructor(root: GUI.Container, content_root:GUI.Container, scene: GameScene){
        super(["Afficher ", "a"], root, content_root, scene);
    }

    getInstruction(): Instruction {
        const slots = this.getSlots();
        const firstChild = slots[0].children[0];

        if (isValuable(firstChild)) {
            const value = firstChild.getValue()[0];
            return new Print(value, this);
        }

        throw new Error("Reading a value on a non-value control. Fuck you");
    }

}