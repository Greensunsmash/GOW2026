import * as GUI from "@babylonjs/gui";
import { BooleenContainer } from "../BooleenContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { ItemSensor } from "../../Language/Booleen/ItemSensor";
import type { Booleen } from "../../Language/Booleen/Booleen";

export class ItemSensorContainer extends BooleenContainer {

    constructor(root: GUI.Container, content_root: GUI.Container, scene: GameScene) {
        super(["Se trouve sur un débris"], root, content_root, scene);
    }

    public getValue(): (Booleen)[] {
        return [new ItemSensor(ctx, this)];
    }
}