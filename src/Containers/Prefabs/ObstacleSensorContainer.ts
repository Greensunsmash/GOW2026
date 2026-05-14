import * as GUI from "@babylonjs/gui";
import { BooleenContainer } from "../BooleenContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { ObstacleSensor } from "../../Language/Booleen/ObstacleSensor";
import type { Booleen } from "../../Language/Booleen/Booleen";
import type { ExecutionContext } from "../../MainLoop/ExecutionContext";

export class ObstacleSensorContainer extends BooleenContainer {

    private ctx : ExecutionContext;
    constructor(root: GUI.Container, content_root: GUI.Container, scene: GameScene, ctx:ExecutionContext) {
        super(["Face à un obstacle"], root, content_root, scene);
        this.ctx = ctx;
    }

    public getValue(): (Booleen)[] {
        return [new ObstacleSensor(this.ctx, this)];
    }
}