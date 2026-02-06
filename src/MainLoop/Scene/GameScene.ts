import * as GUI from "@babylonjs/gui";
import { Scene, Engine, HemisphericLight, Vector3, PointerEventTypes, Color4, MeshBuilder } from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";
import type { Magnet } from "../../Containers/Magnet";
import { AssetLibrary } from "../../Shared/AssetLibrary";
import { LayerMasks } from "../../Shared/LayerMasks";

export abstract class GameScene {
    public scene: Scene;
    public hoverSlot : EmptySlot | Magnet | null = null;

    protected drh : AssetLibrary;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this.drh = new AssetLibrary(this.scene);

        let light = new HemisphericLight("light", new Vector3(0,1,0), this.scene);
        light.includeOnlyWithLayerMask = LayerMasks.SCENE_ONLY;
        light.intensity = 1.0;
    }

    update(): void {
        //this.player.update();
    }

    render(): void {
        this.scene.render();
    }
}