import { ArcRotateCamera, Engine, KeyboardEventTypes, Vector3 } from "@babylonjs/core";
import { INTRO_LEVEL, LayerMasks } from "../../Shared/Constants";
import { LevelReader, type LevelIndexEntry } from "../../Environment/LevelReader";
import { BaseScene } from "./BaseScene";
import { Colors } from "../../Shared/Colors";
import { LevelSelectMap } from "../../MRGUI/levelsel/LevelSelectMap";
import { BaseButton } from "../../MRGUI/buttons/BaseButton";
import { LevelPopup } from "../../MRGUI/levelsel/LevelPopup";
import { ArchipelTrigger } from "../../MRGUI/buttons/ArchipelTrigger";
import { Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { Save } from "../../Shared/Save";
import { LevelCount } from "../../MRGUI/levelsel/LevelCount";
import { RealDialog } from "../../MRGUI/windows/RealDialog";
import { TwoButtonModal } from "../../MRGUI/windows/TwoButtonsModal";

export class LevelSelectScene extends BaseScene {
    public uiCamera: ArcRotateCamera;
    private levelMap: LevelSelectMap;
    private levelPopup: LevelPopup;
    private archipelBtns: ArchipelTrigger[] = [];
    private levelCount: LevelCount;

    constructor(engine: Engine) {
        super(engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString(Colors.SecondaryEnseignement);
    }

    async init(onLevelSelect: (levelName: string) => Promise<void>, onReset: () => void) {
        console.log("init levelselectscene");

        
        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.uiCamera);

        const levelIndex: LevelIndexEntry[] = await LevelReader.getLevelList();
        console.log(levelIndex);
        if (levelIndex.length <= 0) {
            throw new Error("cannot fill level list: level index (index.json) is empty");
        }

        if(!Save.isCompleted(INTRO_LEVEL)) {
            this.intro(onLevelSelect);
            return;
        }

        this.levelPopup = new LevelPopup(this.advancedTexture, "T", () => {console.log("callback not set")});

        this.levelMap = new LevelSelectMap(this.advancedTexture, this);
        let x = -2000;
        let y = 20;
        levelIndex.forEach((lvl: LevelIndexEntry, i: number) => {
            if (lvl.name === "")
                lvl.name = lvl.file;

            const btn = new ArchipelTrigger(lvl.name.replace(" ", "") + "-popupbtn");
            btn.setCallback(() => {
                this.archipelBtns.filter(b => b !== btn).map(t => t.setUnselected());
                this.levelPopup.switchLevelShown(lvl.file, lvl.name);
                this.levelPopup.btn.setCallback(async () => await onLevelSelect(lvl.file));
            });
            if (Save.isCompleted(lvl.file))
                btn.setDone();

            const width = this.levelMap.getContentRoot().widthInPixels;
            const height = this.levelMap.getContentRoot().heightInPixels;

            // Coordonnées "images" => coordonnéees "map"
            btn.leftInPixels = lvl.x ? (lvl.x - width / 2) : x;
            btn.topInPixels = lvl.y ? (height / 2 - lvl.y) : y;

            this.archipelBtns.push(btn);
            this.levelMap.getContentRoot().addControl(btn);

            x += 600;
            if (x >= 2000) {
                y += 400;
                x = 20;
            }
        });

        
        this.advancedTexture.addControl(this.levelPopup);

        this.createTitle();
        
        this.levelCount = new LevelCount(this.advancedTexture);
        this.levelCount.setTotal(levelIndex.length);
        this.levelCount.setCount(Save.getCompletedLevels().length);
        this.advancedTexture.addControl(this.levelCount);

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == KeyboardEventTypes.KEYUP) {
                if (kbInfo.event.key === "Escape") {
                    new TwoButtonModal(this.advancedTexture, "Effacer votre progression ?", "Annuler", "Confirmer",
                        () => {
                            Save.reset();
                            onReset();
                        }
                    );
                }
            }
        });
    }

    private createTitle() {
        const title = new TextBlock();
        title.text = "Carte du Nouveau Monde";
        title.widthInPixels = title.text.length*20;
        title.color = Colors.SecondaryEnseignement;
        title.fontFamily = "Inter";
        title.fontSize = 22;
        title.fontWeight = "600";
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        const titleRect = new Rectangle();
        titleRect.background = Colors.Workbench;
        titleRect.color = Colors.BehindWorkbench;
        titleRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        titleRect.thickness = 2;
        titleRect.shadowOffsetX = 1;
        titleRect.shadowOffsetY = 1;
        titleRect.shadowBlur = 4;
        titleRect.shadowColor = "#00000065";
        titleRect.addControl(title);
        titleRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        titleRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        titleRect.top = "8%";
        
        titleRect.adaptWidthToChildren = true;
        titleRect.height = "60px";

        this.advancedTexture.addControl(titleRect);
    }
    
    async intro(onEnd: (levelFile) => Promise<void>) {
        await RealDialog.show(this.advancedTexture, this, "Tout va bien ?", true);
        await RealDialog.show(this.advancedTexture, this, "Où es-tu passé ?", true);
        await RealDialog.show(this.advancedTexture, this, "J'espère que rien n'est cassé...", true);
        await RealDialog.show(this.advancedTexture, this, "Essayons de te déplacer pour vérifier.", false);
        await onEnd(INTRO_LEVEL);
    }
}