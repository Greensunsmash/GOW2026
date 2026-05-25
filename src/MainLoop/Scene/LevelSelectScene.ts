import { ArcRotateCamera, Engine, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { LayerMasks } from "../../Shared/Constants";
import { LevelSelectModal } from "../../MRGUI/windows/LevelSelectModal";
import { LevelReader, type LevelIndexEntry } from "../../Environment/LevelReader";
import { BaseScene } from "./BaseScene";
import { Colors } from "../../Shared/Colors";

export class LevelSelectScene extends BaseScene {
    public uiCamera: ArcRotateCamera;

    constructor(engine: Engine) {
        super(engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString(Colors.SecondaryEnseignement);
    }

    async init(onLevelSelect: (levelName: string) => Promise<void>) {
        console.log("init levelselectscene");

        const levelIndex: LevelIndexEntry[] = await LevelReader.getLevelList();
        console.log(levelIndex);
        if (levelIndex.length <= 0) {
            throw new Error("cannot fill level list: level index (index.json) is empty");
        }
        const levelSelectModal = new LevelSelectModal(
            this.advancedTexture,
            levelIndex,
            async (levelName: string) => {
                await onLevelSelect(levelName);
            }
        );

        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.uiCamera);
    }
}