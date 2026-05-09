import * as GUI from "@babylonjs/gui";
import { BooleenContainer } from "../BooleenContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { ObstacleSensor } from "../../Language/Booleen/ObstacleSensor";
import type { Booleen } from "../../Language/Booleen/Booleen";

export class ObstacleSensorContainer extends BooleenContainer {

    constructor(root: GUI.Container, content_root: GUI.Container, scene: GameScene) {
        super(["Face à un obstacle"], root, content_root, scene);
    }

    public getValue(): (Booleen)[] {
        return [new ObstacleSensor(ctx, this)];
    }
}