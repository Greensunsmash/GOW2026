import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { ListContainer } from "../ListContainer";
import { StructureContainer } from "../StructureContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Executable } from "../../Language/Executable";
import type { BooleenContainer } from "../BooleenContainer";
import { Si } from "../../Language/Group/Structure/Si";

export class SiContainer extends StructureContainer {
    
    constructor(l:ListContainer, root: GUI.Container, content_root:GUI.Container, scene: GameScene) {
        super(l, new InstructionContainer(["Si ", "b", " est vrai, faire"], root, content_root, scene), new InstructionContainer(["Fin"], root, content_root, scene));
    }

    public getGroup(e:Executable[]): Executable {
        let slots = this.getHeader().getSlots();
        let value = slots[0].children[0] as BooleenContainer;
        return new Si(e, value.getValue()[0]);
    }
}