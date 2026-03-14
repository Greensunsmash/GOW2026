import * as GUI from "@babylonjs/gui";
import type { Executable } from "../../Language/Executable";
import { Pour } from "../../Language/Group/Structure/Pour";
import type { Valeur } from "../../Language/Valeur/Valeur";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { InstructionContainer } from "../InstructionContainer";
import type { ListContainer } from "../ListContainer";
import { StructureContainer } from "../StructureContainer";
import { isValuable } from "../Valuable";

export class PourContainer extends StructureContainer {
    
    constructor(l:ListContainer, root: GUI.Container, scene: GameScene) {
        super(l, new InstructionContainer(["Répéter ", "v", " fois"], root, scene), new InstructionContainer(["Fin"], root, scene));
    }

    public getGroup(e:Executable[]): Executable {
        let slots = this.getHeader().getSlots();
        let value = slots[0].children[0];
        let times;
        if (isValuable(value)) {
            times = value.getValue()[0] as Valeur;
            return new Pour(e, times);
        }
        throw new Error("cannot launch a pour container with an invalid slot. fuck you");
    }
}