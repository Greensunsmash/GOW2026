import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { ListContainer } from "../ListContainer";
import { StructureContainer } from "../StructureContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Executable } from "../../Language/Executable";
import { Pour } from "../../Language/Group/Structure/Pour";
import type { ValeurContainer } from "../ValeurContainer";

export class PourContainer extends StructureContainer {
    
    constructor(l:ListContainer, root: GUI.Container, scene: GameScene) {
        super(l, new InstructionContainer(["Répéter ", "v", " fois"], root, scene), new InstructionContainer(["Fin"], root, scene));
    }

    public getGroup(e:Executable[]): Executable {
        let slots = this.getHeader().getSlots();
        let value = slots[0].children[0] as ValeurContainer;
        return new Pour(e, value.getValue()[0]);
    }
}