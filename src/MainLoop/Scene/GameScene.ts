import * as GUI from "@babylonjs/gui";
import { Scene, Engine, HemisphericLight, Vector3, PointerEventTypes } from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";
import type { Magnet } from "../../Containers/Magnet";
import { AssetLibrary } from "../../Environment/AssetManager";

export abstract class GameScene {
    public scene: Scene;
    public hoverSlot : EmptySlot | Magnet | null = null;

    protected drh : AssetLibrary;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this.drh = new AssetLibrary(this.scene);
        new HemisphericLight("light", new Vector3(0,1,0), this.scene);
    }

    update(): void {
        //this.player.update();
    }

    render(): void {
        this.scene.render();
    }
}