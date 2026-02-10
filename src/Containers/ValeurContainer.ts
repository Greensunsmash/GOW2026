import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";

export class ValeurContainer extends BlocContainer {

    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super("v", list, root, scene);
        new DragBehavior(this);
    }

    build():void {
        // Met le fond en blorange (F587jet27)
        this.background = "#F58727";
        super.build();
    }

}