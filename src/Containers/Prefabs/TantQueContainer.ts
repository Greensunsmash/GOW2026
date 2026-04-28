import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { ListContainer } from "../ListContainer";
import { StructureContainer } from "../StructureContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Executable } from "../../Language/Executable";
import type { BooleenContainer } from "../BooleenContainer";
import { TantQue } from "../../Language/Group/Structure/TantQue";

export class TantQueContainer extends StructureContainer {
    
    constructor(l:ListContainer, root: GUI.Container, scene: GameScene) {
        super(l, new InstructionContainer(["Tant que ", "b", " est vrai, faire"], root, scene), new InstructionContainer(["Fin"], root, scene));
    }

    public getGroup(e:Executable[]): Executable {
        let slots = this.getHeader().getSlots();
        let value = slots[0].children[0] as BooleenContainer;
        return new TantQue(e, value.getValue()[0]);
    }
}