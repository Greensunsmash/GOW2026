import { ArcRotateCamera, Color3, DirectionalLight, Engine, KeyboardEventTypes, MeshBuilder, PBRMaterial, Texture, Vector3 } from "@babylonjs/core";
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
import { GreyBlocker } from "../../MRGUI/misc/GreyBlocker";

export class LevelSelectScene extends BaseScene {
    private static firstOpen = true;

    public uiCamera: ArcRotateCamera;
    public waterCamera: ArcRotateCamera;
    private levelMap: LevelSelectMap;
    private levelPopup: LevelPopup;
    private archipelBtns: ArchipelTrigger[] = [];
    private levelCount: LevelCount;
    private debugMode = false;
    private onLevelSelect: (levelName:string) => void;
    private levelIndex: LevelIndexEntry[];

    constructor(engine: Engine) {
        super(engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    }

    async init(onLevelSelect: (levelName: string) => Promise<void>, onReset: () => void) {
        this.scene.getEngine().displayLoadingUI();
        console.log("init levelselectscene");
        this.onLevelSelect = onLevelSelect;

        
        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;

        this.waterCamera = new ArcRotateCamera("waterCamera", Math.PI/2, 20 * (Math.PI / 180) /*deg->rad*/, 50, Vector3.Zero(), this.scene);
        this.waterCamera.layerMask = LayerMasks.SCENE_ONLY;

        const sun = new DirectionalLight("sun", new Vector3(0.5, -1, 0.5), this.scene);
        //sun.layerMask = LayerMasks.SCENE_ONLY;
        sun.diffuse = new Color3(1.0, 0.98, 0.9); // Un joli blanc cassé un peu chaud
        sun.intensity = 10;
        sun.position = new Vector3(0, 10, 0);

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.waterCamera);
        this.scene.activeCameras.push(this.uiCamera);

        await this.fillBelowMap();


        if(!Save.isCompleted(INTRO_LEVELS[0])) {
            if (LevelSelectScene.firstOpen) {
                
                this.scene.getEngine().hideLoadingUI();
                LevelSelectScene.firstOpen = false;
                new TwoButtonModal(
                    this.advancedTexture,
                    "Activer le son ?",
                    "Non",
                    "Oui",
                    async () =>  {
                        const manager = await SoundManager.get();
                        await manager.init();
                        this.intro(onLevelSelect);
                    },
                    async () => {
                        const manager = await SoundManager.get();
                        await manager.init();
                        SoundManager.toggleMute();
                        this.intro(onLevelSelect);
                    },
                    true /* fullBlack */
                );
            } else {
                this.intro(onLevelSelect);
            }
            return;
        }

        //this.scene.getEngine().displayLoadingUI();
        this.levelPopup = new LevelPopup(this.advancedTexture, "T", () => {console.log("callback not set")}, () => {});
        this.levelMap = new LevelSelectMap(this.advancedTexture, this,
            /*onPan*/ (x: number, y: number, scale: number) => {
                if (this.waterCamera) {
                    // On ajuste la sensibilité avec un multiplicateur (ex: 0.05)
                    // Axe X de l'écran (gauche/droite) => Axe X de la caméra
                    // Axe Y de l'écran (haut/bas) => Axe Z de la caméra en 3D (avant/arrière)
                    const sensitivity = 0.1; 
                    
                    this.waterCamera.target.x = x * sensitivity;
                    this.waterCamera.target.z = -y * sensitivity;
                    this.waterCamera.radius = 60 + (150 - 60) * ((0.6 - scale) / (0.6 - 0.2));
                }
            }
        );
        this.advancedTexture.addControl(this.levelMap);
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

        this.levelMap.forceTriggerCallback();
        this.scene.getEngine().hideLoadingUI();
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
        } else {
            SoundManager.playAmbient("Interplanetary_Odyssey.ogg", true, 0.2);
        }
    }

    private createTitle() {
        const title = new TextBlock();
        title.text = "Carte du Nouveau Monde";
        title.widthInPixels = 300;
        title.color = Colors.LevelSelectTextTitle;
        title.fontFamily = "Inter";
        title.fontSize = 20;
        title.fontWeight = "600";
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        const titleRect = new Rectangle();
        titleRect.background = Colors.LevelSelectBgTitle;
        titleRect.color = Colors.SecondaryEnseignement;
        titleRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        titleRect.thickness = 2;
        titleRect.shadowOffsetX = -2;
        titleRect.shadowOffsetY = 2;
        titleRect.shadowBlur = 4;
        titleRect.shadowColor = "#00000081";
        titleRect.addControl(title);
        titleRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        titleRect.paddingLeft = "30px";
        titleRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        titleRect.top = "30px";

        titleRect.clipChildren = false;
        titleRect.clipContent = false;
        
        titleRect.adaptWidthToChildren = true;
        titleRect.height = "60px";

        this.advancedTexture.addControl(titleRect);
    }

    fillBelowMap() {
        let ground = MeshBuilder.CreateGround("ground", { width: 512, height: 512, subdivisions: 32 }, this.scene);
        
        const waterMat = new PBRMaterial("waterMat", this.scene);
        console.log("plugins on material:", (waterMat as any).pluginManager);


        waterMat.albedoColor = new Color3(0.01, 0.05, 0.08);
        waterMat.roughness = 0.02;
        waterMat.metallic = 0.0;
        waterMat.alpha = 0.75;
        
        const normalMap = new Texture("assets/textures/waterMap.png", this.scene);
        normalMap.uScale = 16;
        normalMap.vScale = 16;

        waterMat.bumpTexture = normalMap;
        waterMat.bumpTexture.level = 0.4;

        const foamTex = new Texture("assets/textures/waterMap.png", this.scene);
        foamTex.uScale = 20;
        foamTex.vScale = 20;

        waterMat.emissiveTexture = foamTex;
        waterMat.emissiveColor = new Color3(0, 0, 0);
        waterMat.emissiveIntensity = 0.8;

        ground.material = waterMat;
        ground.layerMask = LayerMasks.SCENE_ONLY;
        ground.receiveShadows = true;
        ground.position.y = 0.5;

        const normalTex = waterMat.bumpTexture as Texture;
        this.scene.onBeforeRenderObservable.add(() => {
            const dt = this.scene.getEngine().getDeltaTime();

            normalTex.uOffset += dt * 0.0001;
            normalTex.vOffset += dt * 0.00005;
        });
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
        const grey = new GreyBlocker();
        grey.background = "#000000ff";
        this.advancedTexture.addControl(grey);
        await SoundManager.playAmbient("spaceship_crash.mp3", false, 0.6);
        this.advancedTexture.removeControl(grey);
        await RealDialog.show(this.advancedTexture, this, "Tout va bien ?", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "Où es-tu passé ?", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "J'espère que rien n'est cassé...", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "Essayons de te déplacer pour vérifier.", "SCIENTIFIQUE", false, false, true);
        await onEnd(INTRO_LEVELS[0]);
    }
}