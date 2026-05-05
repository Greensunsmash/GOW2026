import * as GUI from "@babylonjs/gui";
import type { Instruction } from "../../Language/Instructions/Instruction";
import { SetVar } from "../../Language/Instructions/SetVar";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { InstructionContainer } from "../InstructionContainer";
import { isValuable } from "../Valuable";

export class SetVarContainer extends InstructionContainer {
    
    name:string;

    constructor(name:string, root: GUI.Container, content_root:GUI.Container, scene: GameScene){
        super(["On met la valeur de " + name + " à ", "a"], root, content_root, scene);
        this.name = name;
    }

    getInstruction(): Instruction {
        const slots = this.getSlots();
        const firstChild = slots[0].children[0];

        if (isValuable(firstChild)) {
            const value = firstChild.getValue()[0];
            return new SetVar(this.name, value);
        }

        throw new Error("Reading a value on a non-value control. Fuck you");
    }
}