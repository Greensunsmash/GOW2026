import { ArcRotateCamera, Engine, KeyboardEventTypes, Vector3 } from "@babylonjs/core";
import { INTRO_LEVELS, LayerMasks } from "../../Shared/Constants";
import { LevelReader, type DialogLine, type LevelIndexEntry } from "../../Environment/LevelReader";
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
import { SoundManager } from "../../Shared/Sounds";

export class LevelSelectScene extends BaseScene {
    private static firstOpen = true;

    public uiCamera: ArcRotateCamera;
    private levelMap: LevelSelectMap;
    private levelPopup: LevelPopup;
    private archipelBtns: ArchipelTrigger[] = [];
    private levelCount: LevelCount;
    private debugMode = false;
    private onLevelSelect: (levelName:string) => void;
    private levelIndex: LevelIndexEntry[];

    constructor(engine: Engine) {
        super(engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString(Colors.SecondaryEnseignement);
    }

    async init(onLevelSelect: (levelName: string) => Promise<void>, onReset: () => void) {
        console.log("init levelselectscene");
        this.onLevelSelect = onLevelSelect;

        
        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.uiCamera);


        if(!Save.isCompleted(INTRO_LEVELS[0])) {
            if (LevelSelectScene.firstOpen) {
                LevelSelectScene.firstOpen = false;
                new TwoButtonModal(
                    this.advancedTexture,
                    "Activer le son ?",
                    "Non",
                    "Oui",
                    async () =>  {
                        const manager = await SoundManager.get();
                        await manager.init();
                        SoundManager.playAmbient("world1.mp3", true, 0.2);
                        this.intro(onLevelSelect);
                    },
                    async () => {
                        const manager = await SoundManager.get();
                        await manager.init();
                        SoundManager.playAmbient("world1.mp3", true, 0.2);
                        SoundManager.toggleMute();
                        this.intro(onLevelSelect);
                    },
                    true /* fullBlack */
                );
            } else 
                this.intro(onLevelSelect);
            return;
        }

        this.levelPopup = new LevelPopup(this.advancedTexture, "T", () => {console.log("callback not set")}, () => {});
        this.levelMap = new LevelSelectMap(this.advancedTexture, this);
        this.advancedTexture.addControl(this.levelPopup);

        this.levelIndex = await LevelReader.getLevelList();
        console.log(this.levelIndex);
        if (this.levelIndex.length <= 0) {
            throw new Error("cannot fill level list: level index (index.json) is empty");
        }

        await this.fillMap();

        this.createTitle();
        
        this.levelCount = new LevelCount(this.advancedTexture);
        this.levelCount.setTotal(this.levelIndex.length);
        this.levelCount.setCount(Save.getCompletedLevels().length);
        this.advancedTexture.addControl(this.levelCount);

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == KeyboardEventTypes.KEYUP) {
                if (kbInfo.event.key === "Escape") {
                    new TwoButtonModal(this.advancedTexture, "Effacer votre progression ?", "Annuler", "Effacer",
                        () => {
                            Save.reset();
                            onReset();
                        }
                    );
                } else if (kbInfo.event.key === "d") {
                    this.debugMode = !this.debugMode;
                    this.fillMap();
                }
            }
        });
        if (LevelSelectScene.firstOpen) {
            LevelSelectScene.firstOpen = false;
            new TwoButtonModal(
                this.advancedTexture,
                "Activer le son ?",
                "Non",
                "Oui",
                async () =>  {
                    const manager = await SoundManager.get();
                    await manager.init();
                    SoundManager.playAmbient("Interplanetary_Odyssey.ogg", true, 0.2);
                },
                async () => {
                    const manager = await SoundManager.get();
                    await manager.init();
                    SoundManager.playAmbient("Interplanetary_Odyssey.ogg", true, 0.2);
                    SoundManager.toggleMute();
                },
                true /* fullBlack */
            );
        }
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

    async fillMap() {
        this.archipelBtns = [];
        this.levelMap.getContentRoot().clearControls();
        let x = -2000;
        let y = 20;
        for (let i = 0; i < this.levelIndex.length; i++) {
            if (!this.debugMode
                && i > 0
                && !Save.isCompleted(this.levelIndex[i-1].file)
            ) {
                break;
            }

            const lvl = this.levelIndex[i];

            if (lvl.name === "")
                lvl.name = lvl.file;

            const btn = new ArchipelTrigger(lvl.name.replace(" ", "") + "-popupbtn");
            btn.setCallback(() => {
                this.archipelBtns.filter(b => b !== btn).map(t => t.setUnselected());
                this.levelPopup.switchLevelShown(lvl.file, lvl.name);
                this.levelPopup.btn.setCallback(async () => await this.onLevelSelect(lvl.file));
                this.levelPopup.skipBtn.setCallback(async () => {
                    Save.completeLevel(lvl.file);
                    this.levelPopup.toggle();
                    const lr = new LevelReader();
                    await lr.loadLevel(lvl.file);
                    const dialogs: DialogLine[] = lr.getAllDialogs();
                    for (let i = 0; i < dialogs.length; i++) {
                        const dialog = dialogs[i];
                        await RealDialog.show(this.advancedTexture, this, dialog.text, dialog.speaker, (i < dialogs.length - 1));
                    }
                    this.fillMap();
                });
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
        }
    }
    
    async intro(onEnd: (levelFile: string) => Promise<void>) {
        await RealDialog.show(this.advancedTexture, this, "Tout va bien ?", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "Où es-tu passé ?", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "J'espère que rien n'est cassé...", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "Essayons de te déplacer pour vérifier.", "SCIENTIFIQUE", false, false, true);
        await onEnd(INTRO_LEVELS[0]);
    }
}