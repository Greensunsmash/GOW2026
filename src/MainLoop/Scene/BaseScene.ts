import { Engine, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { LayerMasks } from "../../Shared/Constants";

export abstract class BaseScene {
    public scene: Scene;
    public advancedTexture: AdvancedDynamicTexture;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        if (this.advancedTexture.layer) {
            this.advancedTexture.layer.layerMask = LayerMasks.UI_ONLY;
        }   
    }

    update(): void {}
}