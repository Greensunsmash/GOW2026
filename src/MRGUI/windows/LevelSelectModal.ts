import * as GUI from "@babylonjs/gui";
import { BaseButton, LargeButton } from "../buttons/BaseButton";
import { ModalWindow } from "./ModalWindow";
import { BaseVSpacer } from "../misc/BaseSpacers";
import type { LevelIndexEntry } from "../../Environment/LevelReader";

// Bte de dialogue
// Choix de Niveau
export class LevelSelectModal extends ModalWindow {
    constructor(
        root: GUI.AdvancedDynamicTexture, 
        levelIndex: LevelIndexEntry[],
        callback: (levelName: string) => Promise<void>
    ) {
        super(root, "Quel niveau qu'on va vers ?");

        this.panel.addControl(new BaseVSpacer());
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
            levelBtn.color = "#0000ff";
            this.panel.addControl(levelBtn);
            this.panel.addControl(new BaseVSpacer());
        });
    }
}