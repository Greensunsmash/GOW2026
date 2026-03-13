import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { ListContainer } from "../ListContainer";
import { StructureContainer } from "../StructureContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Executable } from "../../Language/Executable";
import { Pour } from "../../Language/Group/Structure/Pour";
import { ValeurContainer } from "../ValeurContainer";
import { InputSlot } from "../InputSlot";

export class PourContainer extends StructureContainer {
    
    constructor(l:ListContainer, root: GUI.Container, scene: GameScene) {
        super(l, new InstructionContainer(["Répéter ", "v", " fois"], root, scene), new InstructionContainer(["Fin"], root, scene));
    }

    public getGroup(e:Executable[]): Executable {
        let slots = this.getHeader().getSlots();
        let value = slots[0].children[0];
        let times;
        if (value instanceof ValeurContainer) {
            times = value.getValue()[0];
        } else if (value instanceof InputSlot) {
            times = value.getValue();
        }
        return new Pour(e, times);
    }
}