import { ArcRotateCamera, Engine, Vector3 } from "@babylonjs/core";
import { LayerMasks } from "../../Shared/Constants";
import { LevelReader, type LevelIndexEntry } from "../../Environment/LevelReader";
import { BaseScene } from "./BaseScene";
import { Colors } from "../../Shared/Colors";
import { LevelSelectMap } from "../../MRGUI/levelsel/LevelSelectMap";
import { BaseButton } from "../../MRGUI/buttons/BaseButton";
import type { LevelPopup } from "../../MRGUI/levelsel/LevelPopup";

export class LevelSelectScene extends BaseScene {
    public uiCamera: ArcRotateCamera;
    private levelMap: LevelSelectMap;
    private levelPopup: LevelPopup;

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
        /*const levelSelectModal = new LevelSelectModal(
            this.advancedTexture,
            levelIndex,
            async (levelName: string) => {
                await onLevelSelect(levelName);
            }
        );*/
        this.levelMap = new LevelSelectMap(this.advancedTexture, this);
        let x = -2000;
        let y = 20;
        levelIndex.forEach((lvl: LevelIndexEntry, i: number) => {
            if (lvl.name === "")
                lvl.name = lvl.file;

            /*this.levelMap.addPopup(x, y, lvl.name,  async () => {
                await onLevelSelect(lvl.file);
            });*/
            const btn = new BaseButton(lvl.name.replace(" ", "") + "-popupbtn", lvl.name, /*() => {
                this.levelPopup.title.text = lvl.name;
                this.levelPopup.btn.setCallback(async () => await onLevelSelect(lvl.file));
            }*/ async () => await onLevelSelect(lvl.file), 0);
            btn.leftInPixels = x;
            btn.topInPixels = y;
            this.levelMap.getContentRoot().addControl(btn);

            x += 600;
            if (x >= 2000) {
                y += 400;
                x = 20;
            }
        });

        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.uiCamera);
    }
}