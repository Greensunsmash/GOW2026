import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";

export class ValeurContainer extends BlocContainer {

    constructor(list: string[], advancedTexture: GUI.AdvancedDynamicTexture, scene: GameScene) {
        super("v", list, advancedTexture, scene);
        new DragBehavior(this);
    }

    build():void {
        this.background = "#F58727";
        super.build();
    }

}