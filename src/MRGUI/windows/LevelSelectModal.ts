import * as GUI from "@babylonjs/gui";
import { BaseButton, LargeButton } from "../buttons/BaseButton";
import { ModalWindow } from "./ModalWindow";
import { BaseVSpacer } from "../misc/BaseSpacers";
import type { LevelIndexEntry } from "../../Environment/LevelReader";
import { Colors } from "../../Shared/Colors";

// Bte de dialogue
// Choix de Niveau
export class LevelSelectModal extends ModalWindow {
    constructor(
        root: GUI.AdvancedDynamicTexture, 
        levelIndex: LevelIndexEntry[],
        callback: (levelName: string) => Promise<void>
    ) {
        super(root, "Choix du niveau");
        this.blocker.background = "rgba(0,0,0,0.3)";
        //this.panel.addControl(new BaseVSpacer());
        this.fillLevelNames(levelIndex, callback);
        this.panel.addControl(new BaseVSpacer());
    }

    private fillLevelNames(levelIndex: LevelIndexEntry[], callback: (levelName: string) => Promise<void>) {
        levelIndex.forEach((lvl: LevelIndexEntry, i: number) => {
            if (lvl.name === "")
                lvl.name = lvl.file;

            const levelBtn = new LargeButton("levelBtn" + i, lvl.name, async () => {
                this.blocker.dispose();
                await callback(lvl.file);
            });
            this.panel.addControl(levelBtn);
            this.panel.addControl(new BaseVSpacer());
        });
    }
}