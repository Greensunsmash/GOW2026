import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { BooleenContainer } from "../BooleenContainer";
import type { Booleen } from "../../Language/Booleen/Booleen";
import type { ValeurContainer } from "../ValeurContainer";
import { Sup } from "../../Language/Booleen/Sup";

export class SupContainer extends BooleenContainer {

    constructor(root: GUI.Container, scene: GameScene) {
        super(["", "v", " > ", "v"], root, scene);
    }

    public getValue(): (Booleen)[] {
        let slots = this.getSlots();
        let v1 = slots[0].children[0] as ValeurContainer;
        let v2 = slots[1].children[0] as ValeurContainer;
        return [new Sup(v1.getValue()[0], v2.getValue()[0])];
    }
}