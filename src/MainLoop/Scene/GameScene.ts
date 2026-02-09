import { Engine, Scene } from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";
import type { Magnet } from "../../Containers/Magnet";
import { AssetLibrary } from "../../Shared/AssetLibrary";

export abstract class GameScene {
    public scene: Scene;
    public hoverSlot : EmptySlot | Magnet | null = null;

    protected _drh : AssetLibrary;
    protected _isLoaded : boolean = false;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this._drh = new AssetLibrary(this.scene);
    }


    update(): void {
        //this.player.update();
    }

    render(): void {
        if (this._isLoaded) this.scene.render();
    }
}