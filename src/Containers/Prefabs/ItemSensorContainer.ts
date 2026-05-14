import * as GUI from "@babylonjs/gui";
import { BooleenContainer } from "../BooleenContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { ItemSensor } from "../../Language/Booleen/ItemSensor";
import type { Booleen } from "../../Language/Booleen/Booleen";
import type { ExecutionContext } from "../../MainLoop/ExecutionContext";

export class ItemSensorContainer extends BooleenContainer {
    private ctx : ExecutionContext;
    constructor(root: GUI.Container, content_root: GUI.Container, scene: GameScene, ctx:ExecutionContext) {
        super(["Se trouve sur un débris"], root, content_root, scene);
        this.ctx = ctx;
    }

    public getValue(): (Booleen)[] {
        return [new ItemSensor(this.ctx, this)];
    }
}