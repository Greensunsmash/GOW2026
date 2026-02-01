import * as GUI from "@babylonjs/gui";
import { Scene, Engine, HemisphericLight, Vector3, PointerEventTypes } from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";

export abstract class GameScene {
    public scene: Scene;
    public hoverSlot : EmptySlot | null = null;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        new HemisphericLight("light", new Vector3(0,1,0), this.scene);
    }

    update(): void {
        //this.player.update();
    }

    render(): void {
        this.scene.render();
    }
}