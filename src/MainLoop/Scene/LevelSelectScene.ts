import { AbstractMesh, ArcRotateCamera, Color3, DirectionalLight, DynamicTexture, Engine, KeyboardEventTypes, MeshBuilder, ParticleNumberMathBlockOperations, PBRMaterial, ShadowGenerator, Texture, TransformNode, Vector3, Animation } from "@babylonjs/core";
import { ASSETS_ROOT, INTRO_LEVELS, LayerMasks } from "../../Shared/Constants";
import { LevelReader, type DialogLine, type LevelIndexEntry } from "../../Environment/LevelReader";
import { BaseScene } from "./BaseScene";
import { Colors } from "../../Shared/Colors";
import { LevelSelectMap } from "../../MRGUI/levelsel/LevelSelectMap";
import { BaseButton } from "../../MRGUI/buttons/BaseButton";
import { LevelPopup } from "../../MRGUI/levelsel/LevelPopup";
import { ArchipelTrigger } from "../../MRGUI/buttons/ArchipelTrigger";
import { Control, Rectangle, TextBlock, Image, Line } from "@babylonjs/gui";
import { Save } from "../../Shared/Save";
import { LevelCount } from "../../MRGUI/levelsel/LevelCount";
import { RealDialog } from "../../MRGUI/windows/RealDialog";
import { TwoButtonModal } from "../../MRGUI/windows/TwoButtonsModal";
import { SoundManager } from "../../Shared/Sounds";
import { GreyBlocker } from "../../MRGUI/misc/GreyBlocker";
import { OneButtonModal } from "../../MRGUI/windows/OneButtonModal";
import { AssetLibrary } from "../../Shared/AssetLibrary";

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

    private drh: AssetLibrary;
    private sun: DirectionalLight;
    private shadowGenerator: ShadowGenerator;

    constructor(engine: Engine) {
        super(engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        this.drh = new AssetLibrary(this);
    }

    async init(onLevelSelect: (levelName: string) => Promise<void>, onReset: () => void, levelCompleted? : string) {
        this.scene.getEngine().displayLoadingUI();
        //console.log("init levelselectscene");
        this.onLevelSelect = onLevelSelect;

        
        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;

        this.waterCamera = new ArcRotateCamera("waterCamera", Math.PI/2, 10 * (Math.PI / 180) /*deg->rad*/, 50, Vector3.Zero(), this.scene);
        this.waterCamera.layerMask = LayerMasks.SCENE_ONLY;

        const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.5), this.scene);
        //sun.layerMask = LayerMasks.SCENE_ONLY;
        sun.diffuse = new Color3(1.0, 0.98, 0.9); // Un joli blanc cassé un peu chaud
        sun.intensity = 10;
        sun.position = new Vector3(0, 10, 0);
        sun.shadowFrustumSize = 100;
        this.sun = sun;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.waterCamera);
        this.scene.activeCameras.push(this.uiCamera);

        this.setupShadows();
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
        this.levelPopup = new LevelPopup(this.advancedTexture, "T", () => {}, () => {});
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
        

        //this.setupFogBackground();
        this.advancedTexture.addControl(this.levelMap);
        this.advancedTexture.addControl(this.levelPopup);

        this.levelIndex = await LevelReader.getLevelList();
        //console.log(this.levelIndex);
        if (this.levelIndex.length <= 0) {
            throw new Error("cannot fill level list: level index (index.json) is empty");
        }
        await this.fillMap(levelCompleted);
        
        this.setupFogOfWar();

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
                    SoundManager.playAmbient("LevelMusic", true);
                },
                async () => {
                    const manager = await SoundManager.get();
                    await manager.init();
                    SoundManager.playAmbient("LevelMusic", true);
                    SoundManager.toggleMute();
                },
                true /* fullBlack */
            );
        } else {
            SoundManager.playAmbient("LevelMusic", true);
        }

        if (this.levelIndex.length == Save.getCompletedLevels().length) {
            new OneButtonModal(
                this.advancedTexture,
                "Fin du jeu",
                "Continuer",
                () => {},
                "Vous avez terminé le jeu ! Félicitations !\n \nMerci d'avoir complété le jeu. Nous espérons que cela vous a plu ! N'hésitez pas à nous faire des retours.\nMerci !",
                true
            )
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
        //console.log("plugins on material:", (waterMat as any).pluginManager);


        waterMat.albedoColor = new Color3(0.01, 0.05, 0.08);
        waterMat.roughness = 0.05;
        waterMat.metallic = 0.0;
        waterMat.alpha = 0.75;
        
        const normalMap = new Texture("assets/textures/waterMap.png", this.scene);
        normalMap.uScale = 24;
        normalMap.vScale = 24;

        waterMat.bumpTexture = normalMap;
        waterMat.bumpTexture.level = 0.4;

        const foamTex = new Texture("assets/textures/waterMap.png", this.scene);
        foamTex.uScale = 40;
        foamTex.vScale = 40;

        waterMat.emissiveTexture = foamTex;
        waterMat.emissiveColor = new Color3(0, 0, 0);
        waterMat.emissiveIntensity = 0.8;

        ground.material = waterMat;
        ground.layerMask = LayerMasks.SCENE_ONLY;
        ground.receiveShadows = true;
        ground.position.y = 0;

        const normalTex = waterMat.bumpTexture as Texture;
        this.scene.onBeforeRenderObservable.add(() => {
            const dt = this.scene.getEngine().getDeltaTime();

            normalTex.uOffset += dt * 0.0001;
            normalTex.vOffset += dt * 0.00005;
        });
    }

    private setupFogOfWar(): void {
        const width = 6000;
        const height = 4000;

        const fogTexture = new DynamicTexture(
            "fogOfWar",
            { width, height },
            this.scene,
            true
        );

        fogTexture.hasAlpha = true;

        const ctx = fogTexture.getContext();

        // Brouillard noir semi-transparent
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, width, height);

        // Découpe des zones révélées
        ctx.globalCompositeOperation = "destination-out";

        for (const lvl of this.levelIndex) {

            if (!Save.isCompleted(lvl.file)) {
                continue;
            }

            const x = lvl.x ?? width * 0.5;
            const y = height - (lvl.y ?? 0);

            const radius = 1000;

            const gradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, radius
            );

            gradient.addColorStop(0.0, "rgba(0,0,0,1)");
            gradient.addColorStop(1.0, "rgba(0,0,0,0)");

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";

        fogTexture.update();

        // Conversion en image GUI
        const dataUrl = ctx.canvas.toDataURL();

        const fogImage = new Image("fog", dataUrl);

        fogImage.width = "100%";
        fogImage.height = "100%";
        fogImage.stretch = Image.STRETCH_FILL;
        fogImage.isHitTestVisible = false;

        this.levelMap.getContentRoot().addControl(fogImage);

        // Debug (optionnel)
        // document.body.appendChild(ctx.canvas);
    }
    private setupShadows() {
        this.shadowGenerator = new ShadowGenerator(2048, this.sun);
    
        //this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.useKernelBlur = true;
        this.shadowGenerator.blurKernel = 32;
        this.shadowGenerator.usePoissonSampling = true;
        //this.shadowGenerator.blurScale = 2;
        this.shadowGenerator.bias = 0.001;
        this.shadowGenerator.normalBias = 0.02;
        this.shadowGenerator.depthScale = 25.0;
        //this.shadowGenerator.useContactHardeningShadow = true;
        //this.shadowGenerator.contactHardeningLightSizeUVRatio = 0.025;
    }

    public addShadowCaster(mesh: AbstractMesh) {
        this.shadowGenerator.addShadowCaster(mesh);
    }

    async fillMap(levelCompleted?:string) {

        this.archipelBtns = [];
        this.levelMap.getContentRoot().clearControls();
        let x = -2000;
        let y = 20;
        let map_levels : Map<string,ArchipelTrigger> = new Map();

        // Récupère le level index à partir du nom de fichier
        const getLevel = (lvlName:string) => {
            for (const lvl of this.levelIndex) {
                if (lvl.file == lvlName) {return lvl;}
            }
            throw new Error("Level " + lvlName + " not Found wtf");
        }
        // Affiche le bouton d'un niveau (fonction récursive)
        const show = (lvlToShow:string) => {
            const lvl = getLevel(lvlToShow);
            if (!lvl) return [0, 0, undefined];
            if (lvl.name === "")
                lvl.name = lvl.file;

            const btn = new ArchipelTrigger(lvl.file);
            btn.setCallback(() => {
                this.archipelBtns.filter(b => b !== btn).map(t => t.setUnselected());
                this.levelPopup.switchLevelShown(lvl.file, lvl.name);
                this.levelPopup.btn.setCallback(async () => await this.onLevelSelect(lvl.file));
                this.levelPopup.skipBtn.setCallback(async () => {
                    Save.completeLevel(lvl.file);
                    this.scene.getEngine().displayLoadingUI();
                    this.levelPopup.toggle();
                    await this.fillMap(lvl.file);
                    this.setupFogOfWar();
                    setTimeout(() => this.scene.getEngine().hideLoadingUI(), 2000);
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

            map_levels.set(lvlToShow, btn);
            if (Save.isCompleted(lvl.file)) {
                if (lvl.file == levelCompleted) {
                    this.levelMap.target(lvl.x,lvl.y);
                }
                if (lvl.mainNext && lvl.mainNext.length > 0) {
                    for (const n of lvl.mainNext) {
                        const coords = show(n);
                        if (!coords) continue;
                        const line = new Line(lvlToShow + "to" + n);
                        line.lineWidth = 20;
                        line.zIndex = 1000;
                        line.dash = [20, 20];
                        if (lvl.file == levelCompleted) {
                            this.animateLine(lvl.x, height - lvl.y, line, coords[0], height-coords[1], coords[2]);
                        } else {
                            line.x1 = lvl.x;
                            line.y1 = (height - lvl.y);
                            line.x2 = coords[0];
                            line.y2 = height - coords[1];
                        }
                        if (Save.isCompleted(n)) line.color = "green";
                        else line.color = "red";
                        this.levelMap.getContentRoot().addControl(line);
                    }
                }
                if (lvl.bonus && lvl.bonus.length > 0) {
                    for (const n of lvl.bonus) {
                        const coords = show(n);
                        if (!coords) continue;
                        const line = new Line(lvlToShow + "to" + n);
                        line.lineWidth = 20;
                        line.zIndex = 1000;
                        line.dash = [20, 20];
                        if (lvl.file == levelCompleted) {
                            this.animateLine(lvl.x, (height - lvl.y), line, coords[0], height-coords[1], coords[2]);
                        } else {
                            line.x1 = lvl.x;
                            line.y1 = (height - lvl.y);
                            line.x2 = coords[0];
                            line.y2 = height - coords[1];
                        }
                        if (Save.isCompleted(n)) line.color = "green";
                        else line.color = "blue";
                        this.levelMap.getContentRoot().addControl(line);
                    }
                }
            }
            return [lvl.x,lvl.y,btn];

        }
        console.log(Save.getCompletedLevels());
        console.log(this.levelIndex);

        for (const lvlToShow of Save.getCompletedLevels()) {
            if (map_levels.has(lvlToShow)) continue;
            // En gros on affiche le niveau qui lui même affiche ses suivants etc etc, ici on vérifie juste qu'on en loupe pas
            show(lvlToShow);
        }

        console.log(this.levelMap.getContentRoot().children);
    }
    
    // Il faut trouver le moyen de lancer après le chargement
    private animateLine(x1:number, y1:number, line:Line, x2:number, y2:number, btn:ArchipelTrigger) {

        const duration = 2000;
        line.x1 = x1;
        line.y1 = y1;
        btn.isVisible = false;

        const animationX = new Animation(
            "lineX",
            "x2",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        animationX.setKeys([
            { frame: 0, value: x1 },
            { frame: duration * 60 / 1000, value: x2 }
        ]);

        const animationY = new Animation(
            "lineY",
            "y2",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        animationY.setKeys([
            { frame: 0, value: y1 },
            { frame: duration * 60 / 1000, value: y2 }
        ]);

        line.animations = [
            animationX,
            animationY
        ];

        this.scene.beginDirectAnimation(
            line,
            [animationX, animationY],
            0,
            duration * 60 / 1000,
            false,
            1,
            () => {btn.isVisible = true}
        );
    }

    async intro(onEnd: (levelFile: string) => Promise<void>) {
        const grey = new GreyBlocker();
        grey.background = "#000000ff";
        this.advancedTexture.addControl(grey);
        await SoundManager.playAmbient("Intro", false);
        this.advancedTexture.removeControl(grey);
        await RealDialog.show(this.advancedTexture, this, "Tout va bien ?", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "Où es-tu passé ?", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "J'espère que rien n'est cassé...", "SCIENTIFIQUE", true, false, true);
        await RealDialog.show(this.advancedTexture, this, "Essayons de te déplacer pour vérifier.", "SCIENTIFIQUE", false, false, true);
        await onEnd(INTRO_LEVELS[0]);
    }
}