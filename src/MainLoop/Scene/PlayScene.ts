import { AbstractMesh, ArcRotateCamera, BloomEffect, ChromaticAberrationPostProcess, Color3, Color4, CreateBox, CubeTexture, DirectionalLight, Engine, FxaaPostProcess, GPUParticleSystem, GrainPostProcess, KeyboardEventTypes, MeshBuilder, NodeMaterial, ParticleSystem, PBRMaterial, ShadowGenerator, Texture, Vector3, Viewport } from "@babylonjs/core";
import { BasicInstContainer } from "../../Containers/BasicInstContainer";
import { BlocContainer } from "../../Containers/BlocContainer";
import { DragBehavior } from "../../Containers/DragBehavior";
import { InputSlot } from "../../Containers/InputSlot";
import { InstructionContainer } from "../../Containers/InstructionContainer";
import { ListContainer } from "../../Containers/ListContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { SetVarContainer } from "../../Containers/Prefabs/SetVarContainer";
import { VarValueContainer } from "../../Containers/Prefabs/VarValueContainer";
import { Level } from "../../Environment/Level";
import { LevelReader, State, type DialogLine, type IslandMap, type ItemType } from "../../Environment/LevelReader";
import { Memory } from "../../Language/Memory";
import { BlockCount } from "../../MRGUI/mainscreen/BlockCount";
import { BottomBar } from "../../MRGUI/mainscreen/BottomBar";
import { ItemsHUD } from "../../MRGUI/mainscreen/ItemsHUD";
import { TopBar } from "../../MRGUI/mainscreen/TopBar";
import { OneButtonModal } from "../../MRGUI/windows/OneButtonModal";
import { RealDialog } from "../../MRGUI/windows/RealDialog";
import { TwoButtonModal } from "../../MRGUI/windows/TwoButtonsModal";
import { ASSETS_ROOT, INTRO_LEVELS, LayerMasks } from "../../Shared/Constants";
import { Save, type IslandSaveData } from "../../Shared/Save";
import { SoundManager } from "../../Shared/Sounds";
import type { InstructionData, ProgramData } from "../../Shared/types";
import { ExecutionContext } from "../ExecutionContext";
import { GameScene } from "./GameScene";
import { WaterFoamPlugin } from "../../Shared/WaterFoam";
import { VarDisplay } from "../../MRGUI/mainscreen/VarDisplay";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene { // ;)
    //private player: Player;

    private loadedFile: string = "";
    private levelReader: LevelReader;
    private currentIsland: number = 0;
    private currentIslandMap: IslandMap;
    private currentLeaf: number = 19937574471;

    private ctx: ExecutionContext;
    private uiCamera: ArcRotateCamera;
    private mapCamera: ArcRotateCamera;
    private dirLight: DirectionalLight;
    public shadowGenerator: ShadowGenerator;

    private onLevelGaveup?: () => void;
    private onLevelWon?: (levelFile: string) => void;

    private canRun: boolean = true;
    private dryAttemptMode: boolean = false;

    private blockCountDisp: BlockCount;
    private itemsHud: ItemsHUD;
    private varDisp: VarDisplay;

    private memory: Memory = Memory.get();

    private isRestoring = false;
    private saveInterval;
    

    constructor(engine: Engine) {
        super(engine);
        this.currentLeaf = this.currentLeaf * 2 - (this.currentLeaf + this.currentLeaf);
        //this.init();
    }

    update(): void {
        //this.player.update();
    }

    async init(levelName: string | undefined = "level1.json", onLevelGaveup?: () => void, onLevelWon?: (succededLevel: string) => void) {
        this.isRestoring = false;
        
        this.topBar = new TopBar(this.advancedTexture, () => {
            new TwoButtonModal(
                this.advancedTexture,
                "Abandonner et retourner à la carte ?",
                "Annuler",
                "Abandonner",
                () => onLevelGaveup?.(),
            );
        },  () => {
            new TwoButtonModal(
                this.advancedTexture,
                "Restaurer le carnet de l'île précédente ?",
                "Annuler",
                "Restaurer",
                () => this.restoreProgram(true)
            );
        });
        if (INTRO_LEVELS.includes(levelName) || INTRO_LEVELS.every(Save.isCompleted))
            this.advancedTexture.addControl(this.topBar);

        
        this.btmBar = new BottomBar(this.advancedTexture,
            () => this.reset(),
            () => this.stepBack(),
            () => this.nextStep(),
            () => this.dryAttempt(),
            () => this.previousLeaf(),
            () => this.nextLeaf(true),
            () => this.pause()
        );
        this.advancedTexture.addControl(this.btmBar);

        this.varDisp = new VarDisplay(this.advancedTexture);
        this.advancedTexture.addControl(this.varDisp);

        await this.initGameScene(levelName);

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == KeyboardEventTypes.KEYUP) {
                console.log("key event", kbInfo.event.key);
                if (kbInfo.event.key === "l") {
                    console.log("nextleaf");
                    this.nextLeaf();
                } else if (kbInfo.event.key === "p") {
                    console.log("prevleaf");
                    this.previousLeaf();
                } else if (kbInfo.event.key == "ArrowRight") {
                    console.log("right");
                    this.nextIsland();
                } else if (kbInfo.event.key == "ArrowLeft") {
                    console.log("left");
                    this.previousIsland();
                } else if (kbInfo.event.key == "b") {
                    console.log("stepback");
                    this.stepBack();
                } else if (kbInfo.event.key == "f") {
                    console.log("nextstep");
                    this.nextStep();
                } else if (kbInfo.event.key == "z") {
                    console.log("zoom in");
                    this.workspace.zoom(0.1);
                } else if (kbInfo.event.key == "a") {
                    console.log("zoom out");
                    this.workspace.zoom(-0.1);
                } else if (kbInfo.event.key == "o") {
                    console.log("pause");
                    this.pause();
                } else if (kbInfo.event.key == "r") {
                    console.log("reset");
                    this.reset();
                }
            }
        });

        this.onLevelGaveup = onLevelGaveup;
        this.onLevelWon = onLevelWon;
    }

    async initGameScene(levelName: string) {
        this.loadedFile = levelName;
        this.scene.getEngine().displayLoadingUI();

        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;
        this.mapCamera = new ArcRotateCamera("mapCamera", Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), this.scene);
        this.mapCamera.viewport = new Viewport(0.5, 0, 0.5, 1);
        this.mapCamera.layerMask = LayerMasks.SCENE_ONLY;

        this.mapCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        this.mapCamera.upperBetaLimit = Math.PI / 2.1;
        this.mapCamera.lowerRadiusLimit = 12;
        this.mapCamera.upperRadiusLimit = 25;

        this.dirLight = new DirectionalLight("sun", new Vector3(0.5, -1, 0.5), this.scene);
        this.dirLight.diffuse = new BABYLON.Color3(1.0, 0.98, 0.9);
        this.dirLight.intensity = 2;
        this.dirLight.shadowFrustumSize = 25;
        //this.dirLight.autoUpdateExtends = true;
        this.dirLight.shadowMaxZ = 100;
        this.dirLight.shadowMinZ = -10;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.mapCamera);
        this.scene.activeCameras.push(this.uiCamera);
        this.addDetachControlObservables();

        this.fillBelow();
        this.setupSkybox();
        this.setupShadows();
        this.setupThePipeToTheline();
        this.setupCloud();

        await this.loadAssets();
        this.levelReader = new LevelReader();
        await this.levelReader.loadLevel(levelName);
        await this.loadIsland(0);

        this.restoreProgram(false);
        this.saveInterval = window.setInterval(() => {
            if (!this.isRestoring) this.saveProgram();
        }, 5000);

        /* let light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.includeOnlyWithLayerMask = LayerMasks.SCENE_ONLY;
        light.intensity = 1.0; */

        const worldNo = LevelReader.getWorldNo(levelName);
        let vol = 1;
        if (worldNo == 2) vol = 0.4;
        else if (worldNo == 3) vol = 0.7;
        SoundManager.playAmbient(`world${worldNo}.mp3`, true, vol);

        this._isLoaded = true;
        this.scene.getEngine().hideLoadingUI();
    }

    private fillBelow() {
        let ground = MeshBuilder.CreateGround("ground", { width: 512, height: 512, subdivisions: 32 }, this.scene);

        const waterMat = new PBRMaterial("waterMat", this.scene);
        console.log("plugins on material:", (waterMat as any).pluginManager);


        waterMat.albedoColor = new Color3(0.01, 0.05, 0.08);
        waterMat.roughness = 0.02;
        waterMat.metallic = 0.0;
        waterMat.alpha = 0.75;
        
        const normalMap = new Texture("assets/textures/waterMap.png", this.scene);
        normalMap.uScale = 8;
        normalMap.vScale = 8;

        waterMat.bumpTexture = normalMap;
        waterMat.bumpTexture.level = 0.4;

        const foamTex = new Texture("assets/textures/waterMap.png", this.scene);
        foamTex.uScale = 10;
        foamTex.vScale = 10;

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

            normalTex.uOffset += dt * 0.00001;
            normalTex.vOffset += dt * 0.000005;
        });
    }

    private setupSkybox() {
        const texture = new CubeTexture(ASSETS_ROOT + "/skybox/moon.env", this.scene);
        texture.level = 1.0;
        this.scene.environmentTexture = texture;
        this.scene.imageProcessingConfiguration.exposure = 1.0;
        this.scene.environmentIntensity = 1.4;// 1.4;
        // Create a skybox mesh using this texture
        const skybox = this.scene.createDefaultSkybox(texture, true, 100000, 0);
    }

    private setupShadows() {
        this.shadowGenerator = new ShadowGenerator(2048, this.dirLight);
    
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

    private setupThePipeToTheline() {
        const engine = this.scene.getEngine();
        const pp = new BloomEffect(this.scene, 0.8, 0.8, 0.1);
        pp._attachCameras(this.mapCamera);
        pp._enable(this.mapCamera);

        const fxaa = new FxaaPostProcess("fxaa", {
            camera: this.mapCamera,
            engine: this.scene.getEngine(),
            size: { 
                width: this.scene.getEngine().getRenderWidth() * 0.5, 
                height: this.scene.getEngine().getRenderHeight() 
            },
            samplingMode: BABYLON.Constants.TEXTURE_BILINEAR_SAMPLINGMODE,
            reusable: false
        }, this.mapCamera);
        this.mapCamera.attachPostProcess(fxaa);

        const grain = new GrainPostProcess("grain", {
            camera: this.mapCamera,
            engine: this.scene.getEngine(),
            
        }, this.mapCamera);
        grain.intensity = 2;
        grain.animated = true;
        this.mapCamera.attachPostProcess(grain);

        /*const chrom = new ChromaticAberrationPostProcess("chrom", this.scene.getEngine().getRenderWidth() * 0.5, this.scene.getEngine().getRenderHeight(), {
            camera: this.mapCamera,
            engine: this.scene.getEngine()
        }, this.mapCamera);
        chrom.inte
        this.mapCamera.attachPostProcess(chrom);*/
    }

    private setupCloud() {
        let fogTexture = new Texture(ASSETS_ROOT + "other/cloud.png", this.scene);
        const fountainPos = new Vector3(0, 8, 0);
        const minEmitOffset = new Vector3(-100,0,-100);
        const maxEmitOffset = new Vector3(100, 8, 100);

        let minColor, maxColor;
        if (this.loadedFile === "level21.json") {
            minColor = new Color4(0.76, 0, 1, 0.05);
            maxColor = new Color4(0.79,0.02,1, 0.15);
        } else {
            minColor = new Color4(1, 1, 1, 0.05);
            maxColor = new Color4(1,1,1, 0.15);
        }

        let volCloudParticles;
        let volCloudFountain;
        if (GPUParticleSystem.IsSupported) {
            volCloudParticles = new GPUParticleSystem( `volClouds`, {capacity: 50000}, this.scene);
            volCloudParticles.activeParticleCount = 1000;
            volCloudParticles.manualEmitCount = volCloudParticles.activeParticleCount;
        } else {
            volCloudParticles = new ParticleSystem(`volClouds`, 1000, this.scene);
            volCloudParticles.manualEmitCount = volCloudParticles.getCapacity();
        }
        volCloudParticles.minEmitBox = minEmitOffset;
        volCloudParticles.maxEmitBox = maxEmitOffset;
        volCloudParticles.particleTexture = fogTexture.clone();

        volCloudFountain = CreateBox(`volCloudsFountain`, {size: .01}, this.scene);
        volCloudFountain.position = fountainPos;
        volCloudFountain.visibility = 0;
        volCloudParticles.emitter = volCloudFountain;

        volCloudParticles.color1 = minColor;
        volCloudParticles.color2 = maxColor;
        volCloudParticles.colorDead = minColor;
        volCloudParticles.minSize = 5;
        volCloudParticles.maxSize = 10;
        volCloudParticles.minLifeTime = 15;
        volCloudParticles.maxLifeTime = 15;
        volCloudParticles.emitRate = 50000;
        volCloudParticles.blendMode = ParticleSystem.BLENDMODE_STANDARD;
        volCloudParticles.gravity = new Vector3(0, 0, 0);
        volCloudParticles.direction1 = new Vector3(2, 0, 0);
        volCloudParticles.direction2 = new Vector3(6, 0, 0);
        volCloudParticles.minAngularSpeed = -2;
        volCloudParticles.maxAngularSpeed = 2;
        volCloudParticles.minEmitPower = .5;
        volCloudParticles.maxEmitPower = 2;
        volCloudParticles.updateSpeed = 0.005;

        volCloudParticles.start();
    }

    private focusCamera() {
        const center = this.level.getVisualCenter();
        this.mapCamera.setTarget(center);

        const shape = this.level.mapShape();
        const maxDimension = Math.max(shape[0], shape[1], shape[2]);

        const cameraDistance = (maxDimension / 2) / Math.tan(this.mapCamera.fov / 2);
        const margin = 1.75; 
        
        this.mapCamera.radius = cameraDistance * margin;
    }

    public async loadLeaf(index: number) {
        this.btmBar.updateLeafIndicator(`Étape ${index + 1} sur ${this.currentIslandMap.length}`)

        this.currentLeaf = index;
        this.canRun = false; // hop on arrete d'exécuter

        if (this.level) this.level.dispose();

        const map = this.currentIslandMap[index];
        this.level = new Level(map, LevelReader.getWorldNo(this.loadedFile), this._drh, this.scene);
        await this.level.init();

        this.focusCamera();

        if (this.ctx) this.ctx.newLevel(this.level);
        else this.ctx = new ExecutionContext(this.level, this);

        const new_goals = this.levelReader.getGoalsForIsland(this.currentIsland);
        for (const goal of new_goals) {
            switch (goal.name) {
                case "arrival":
                    const flagPos = this.level.findStatePos(State.Flag);
                    if (flagPos)
                        goal.args = { flagPos: flagPos };
                    else
                        throw new Error("cant set an arrival goal without any flag in the leaf map !");
                    break;
                default:
                    break;
            }
        }
        this.memory.setOnProgramEnd(undefined);
        this.memory.clear();
        this.modeUpdate();
        this.ctx.setGoals(new_goals);

        this.ctx.getRobot().setOnItemsChange((items: ItemType[]) => {
            //console.log("top bar " + this.topBar);
            //console.log("top bar  idsip" + this.topBar);
            this.topBar.itemDisp.setItems(items.length, this.level.getAllItemTypes().length);
        });
        //console.log("top bar " + this.topBar);
        //console.log("top bar  idsip" + this.topBar);
        this.topBar.itemDisp.setItems(0, this.level.getAllItemTypes().length);

        this.updateInstructionCount();
        this.btmBar.triggerUpdate();
        this.clearHighlights();
    }

    // Renvoie true si on a bien changé de leaf,
    // false si on était deja a la derniere
    public async nextLeaf(manual: boolean = false): Promise<boolean> {
        let next = this.currentLeaf + 1;

        if (next >= this.currentIslandMap.length) {
            console.log("Dernière étape atteinte. manual : " + manual);
            if (!manual) {
                const endDialogs = this.levelReader.getEndDialog(this.currentIsland);
                if (endDialogs) {
                    await this.showDialogs(endDialogs);
                    await this.nextIsland();
                } else {
                    new OneButtonModal(
                        this.advancedTexture,
                        "L'île est terminée !",
                        "Continuer",
                        async () => await this.nextIsland()
                    );
                }
                return false;
            } else {
                next = 0;
            }
        }

        await this.loadLeaf(next);
        return true;
    }

    public async previousLeaf() {
        let prev = this.currentLeaf - 1;
        if (prev < 0) {
            /*new OneButtonModal(
                this.advancedTexture,
                "Plus d'autre feuille",
                "Fermer",
                () => { }
            );*/
            prev = this.currentIslandMap.length - 1;
        }
        await this.loadLeaf(prev);
    }

    public async loadIsland(index: number) {
        const island = this.levelReader.getIsland(index);
        if (!island || island.length === 0) {
            throw new Error("Island not found or empty");
        }
        this.currentIsland = index;
        this.currentIslandMap = island;


        await this.loadLeaf(0);

        this.toolbox.clear();
        this.blockCount = 0;
        //this.ctx = new ExecutionContext(this.level.(), this);
        this.levelReader.setupToolbox(index, this.toolbox, this.ctx, this);
        this.topBar.blockCount.setLimit(this.levelReader.getBlockLimitForIsland(this.currentIsland));

        this.topBar.loadClues(this.levelReader.getClues(this.currentIsland));

        const multipleLeaf = (this.currentIslandMap.length >= 2);
        this.btmBar.cdPlaybar.switchMode(multipleLeaf);
        this.btmBar.triggerUpdate();
        this.btmBar.leafNav.isVisible = multipleLeaf;

        this.memory.setOnStateUpdate(() => {
            this.btmBar.triggerUpdate();
        });

        this.memory.setOnVarUpdate(() => {
            this.varDisp.updateFromMemory();
        });

        
        let saved = undefined;
        if (this.currentIsland - 1 >= 0 ) {
            saved = Save.getIslandData(this.loadedFile, this.currentIsland - 1);
        }
        if (saved?.program && saved.program.length > 0) {
            this.topBar.topSpSpacer.isVisible = true;
            this.topBar.restoreBtn.isVisible = true;
        } else {
            this.topBar.topSpSpacer.isVisible = false;
            this.topBar.restoreBtn.isVisible = false;
        }

        const beginDialogs = this.levelReader.getBeginDialogs(this.currentIsland);
        if (beginDialogs) {
            this.showDialogs(beginDialogs);
        }
    }

    public async showDialogs(dialogs: DialogLine []) {
        for (let i = 0; i < dialogs.length; i++) {
            const dialog = dialogs[i];
            await RealDialog.show(this.advancedTexture, this, dialog.text, dialog.speaker, (i < dialogs.length - 1));
        }
    }

    public async nextIsland() {
        const next = this.currentIsland + 1;

        if (next >= (this.levelReader as any).structure.length) {
            console.log("Dernière île atteinte");
            const jinglePromise = SoundManager.playAmbient("success.mp3", false, 1);
            const m = new OneButtonModal(
                this.advancedTexture,
                "Félicitations, tu as complété cet archipel !",
                "Retour à la carte",
                async () => { 
                    await jinglePromise; 
                    m.goAway();
                    if (this.onLevelWon) this.onLevelWon(this.loadedFile); 
                },
                undefined,
                false
            );
            return;
        }

        await this.loadIsland(next);
    }

    public async previousIsland() {
        const prev = this.currentIsland - 1;
        if (prev < 0) return;
        await this.loadIsland(prev);
    }

    async loadAssets() {
        await Promise.all([
            this._drh.loadSingleAsset("robot", "custom/robo.glb"),

            //this._drh.loadSingleAsset("ground", "grasscube.glb"),
            this._drh.loadSingleAsset("sand", "blockbits/sand.glb"),
            this._drh.loadSingleAsset("grass", "platformkit/block-grass.glb"),
            this._drh.loadSingleAsset("cursed", "custom/cursedgrd.glb"),

            //this._drh.loadSingleAsset("wall", "stone.02.glb"),
            this._drh.loadSingleAsset("palm1", "piratekit/palm-straight.glb"),
            this._drh.loadSingleAsset("palm2", "piratekit/palm-bend.glb"),
            this._drh.loadSingleAsset("palm3", "piratekit/palm-detailed-bend.glb"),
            this._drh.loadSingleAsset("palm4", "piratekit/palm-detailed-straight.glb"),
            this._drh.loadSingleAsset("tree1", "platformkit/tree-pine.glb"),

            //this._drh.loadSingleAsset("pill", "pill.glb"),
            this._drh.loadSingleAsset("debris1", "spacekit/debris1.glb"),
            this._drh.loadSingleAsset("debris2", "spacekit/rocket_finsB.glb"),

            //this._drh.loadSingleAsset("heart", "heart.01.glb"),
            this._drh.loadSingleAsset("boat", "piratekit/boat-row-small.glb"),
            this._drh.loadSingleAsset("boat2", "piratekit/boat-row-large.glb"),

            this._drh.loadSingleAsset("river", "water.glb"),

            this._drh.loadSingleAsset("pig", "cubepets/animal-pig.glb"),

            //this._drh.loadSingleAsset("sci", "custom/scientifique.glb"),
            this._drh.loadSingleAsset("sci", "minichars/character-female-d.glb"),
            this._drh.loadSingleAsset("circe", "custom/circe.glb")
        ]);
    }

    addDetachControlObservables() {
        this.leftPanel.onPointerEnterObservable.add(() => {
            this.mapCamera.detachControl();
        });

        this.leftPanel.onPointerOutObservable.add(() => {
            this.mapCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        });
    }

    public run(onlyOneStep: boolean = false, skip : boolean = false, automaticRun: boolean = false) { // Si skip est vrai, pas d'animation
        if (!automaticRun && this.memory.isCurrentlyMoving()) {
            console.log("not running.");
            return;
        }

        this.memory.clear();
        
        //console.log("Avant le run");
        Memory.print()
        this.clearHighlights();
        this.level.reinitLevel();
        this.canRun = true;
        this.memory.skip = skip;
        this.memory.setPlaying(!onlyOneStep);
        const prevLeafIndex = this.currentLeaf;

        // "Compilation" :

        let child_list = this.workspace.getContentRoot().children;
        let start_block: ListContainer | undefined;

        for (const child of child_list) {
            if (child instanceof ListContainer) {
                if (!child.isFirst()) continue;
                if (child.getFirst() instanceof FlagContainer) start_block = child;
                else if (!child.getInstructionGroup()?.onLaunch()) throw new Error("error 404 Il y a eu une erreur au lancement");
            }
        }

        if (start_block) {
            const grp = start_block.getInstructionGroup();
            console.log(grp);
            if (grp && grp.onLaunch()) {
                grp.execute([]);
                this.memory.setRan();
            }
            else throw new Error("error 406 Il y a eu une erreur au lancement");
        }
    }

    public stepBack(skip : boolean = false) {
        this.memory.skip = skip;
        this.memory.stepBack();
    }

    public pause() { // Mets en pause ou arrète la pause
        if (!this.canRun) return;
        if (this.memory.isPlaying()) this.memory.setPlaying(false);
        else this.memory.continue();
    }

    public reset() { // Permet de revenir à l'état initiale
        const effectiveReset = () => {
            this.clearHighlights();
            this.memory.programEnd();
            this.memory.setPlaying(false);
            this.memory.clear();
            this.level.reinitLevel();
            this.canRun = true;
            this.memory.wait_reset = false;
            this.memory.reset_callback = () => {};
            this.btmBar.triggerUpdate();
            this.modeUpdate();
        };

        if (!this.memory.isPlaying() && !this.memory.isCurrentlyMoving()) {
            effectiveReset();
            return;
        }
        this.memory.reset_callback = () => effectiveReset();
        this.memory.wait_reset = true;
    }

    public nextStep(skip : boolean = false){
        if (this.ctx && this.ctx.getRobot().isDead()) { 
            console.warn("cant forwar dead !");
            return;
        }
        this.memory.skip = skip;
        //console.log("TRYING to run next step");
        //console.log(this.memory.getCurrentInstruction());
        if (!(this.memory.hasRan()) || !(this.memory.getCurrentInstruction())) {
            //console.log("running scene.run");
            this.run(true);
        } else
            this.memory.nextStep();
    }

    public stopRun() {
        this.clearHighlights();
        this.canRun = false;
        this.memory.setPlaying(false);
    }

    public async attemptAllLeafs() {
        if (this.currentLeaf != 0) {
            await this.loadLeaf(0);
        }
        this.dryAttemptMode = false;
        this.scene.onAfterRenderObservable.addOnce(async () => await this.run(false, false, true));
    }

    public async dryAttempt() {
        //console.log("scene.dryAttempt");
        this.dryAttemptMode = true;
        console.log("dryAttempt : " + this.dryAttemptMode);
        await this.run();
    }

    public isDryAttempt(): boolean {
        return this.dryAttemptMode;
    }
 
    public async onGoalReached() {
        console.log("dry attempt mode " + this.dryAttemptMode);
        const continuousMode = this.memory.isPlaying();
        this.stopRun();
        this.btmBar.triggerUpdate();
        this.memory.clear();
        const limit = this.levelReader.getBlockLimitForIsland(this.currentIsland);
        if (limit && this.blockCount > limit) {
            new OneButtonModal(
                this.advancedTexture,
                "Bien joué, mais le carnet de mission est trop long...",
                "Réessayer",
                () => {}
            );
            return;
        }
        if (this.isDryAttempt() && this.currentIslandMap.length >= 2) {
            console.log("dry attempt success");
            new TwoButtonModal(
                this.advancedTexture,
                "Bravo ! On essaie sur toutes les étapes ?",
                "Non",
                "Essayer",
                () => this.attemptAllLeafs()
            );
        } else {
            const isAnotherLeafLeft = await this.nextLeaf(false);
            // si je mets pas ce delay ca marche pas..
            // a investiguer 
            //await new Promise((rs, rj) => setTimeout(rs, 500));
            // en fait jai trouvé mieux
            if (isAnotherLeafLeft) {
                if (true /*continuousMode*/) {
                    //console.log("running on next leaf");
                    //await new Promise((rs, rj) => setTimeout(rs, 500));
                    this.scene.onAfterRenderObservable.addOnce(async () => await this.run(false, false, true));
                } else {
                    this.level.reinitLevel();
                    this.canRun = true;
                }
            }
        }
    }

    public onGoalUnreached() {
        this.clearHighlights();
        if (!this.canRun) return;
        this.stopRun();
        this.btmBar.triggerUpdate();
        new OneButtonModal(
            this.advancedTexture,
            "Dommage, vous n'avez pas atteint l'objectif !",
            "Réessayer",
            () => { }
        );
    }

    public onRobotDead(msg?: string) {
        if (!this.canRun) return;
        this.stopRun();
        this.memory.programEnd();
        this.level.getRobot().die();
        this.btmBar.triggerUpdate();
        new OneButtonModal(
            this.advancedTexture,
            msg ?? "Oh non, le robot est détruit !",
            "Réessayer",
            () => { }
        );
    }

    // le compteur incrém/décrém n'était pas une solution fiable
    public override updateInstructionCount() {
        let child_list = this.workspace.getContentRoot().children;
        let count = 0;
        for (const child of child_list) {
            if (child instanceof ListContainer) {   
                if (!child.isFirst()) continue;
                if (child.getFirst() instanceof FlagContainer)
                    count += child.getInstructionCount();
            }
        } 
        //console.log("new instruction count is : ", count);
        this.blockCount = count;
        this.topBar.blockCount.setBlockCount(count);
        //this.saveProgram();
    }

    public clearHighlights() {
        let child_list = this.workspace.getContentRoot().children;
        let count = 0;
        for (const child of child_list) {
            if (child instanceof ListContainer) {   
                child.clearHighlights();
            }
        } 
    }

    public modeUpdate() {
        this.toolbox.onModeChange();
        let child_list = this.workspace.getContentRoot().children;
        for (const child of child_list) {
            if (child instanceof ListContainer) {   
                const insts = child.getInnerInstContainers();
                for (const inst of insts) {
                    if (inst instanceof BasicInstContainer || inst instanceof SetVarContainer)
                        inst.triggerModeUpdate();
                }
            }
        } 
    }

    public saveProgram() {
        if (this.isRestoring) {console.log("skipping save"); return;}
        console.log("saving program");
        const lists = [...this.workspace.getContentRoot().children];
        const data: ProgramData = [];
        for (const  child of lists) {
            if (child instanceof ListContainer) {
                data.push(child.serializeList());
            }
        }
        Save.setIslandData(this.loadedFile, this.currentIsland, data);
        //console.log("save data ", data, " at file ", this.loadedFile, " and island ", this.currentIsland);
    }

    public restoreProgram(manual: boolean = false) {
        if (this.isRestoring) {console.log("skipping restore"); return;}
        let saved: IslandSaveData | undefined = undefined;
        if (manual) {
            if (this.currentIsland - 1 >= 0 ){
                saved = Save.getIslandData(this.loadedFile, this.currentIsland - 1);
            }
        } else {
            saved = Save.getIslandData(this.loadedFile, this.currentIsland);
        }

        if (!saved) {
            if (manual) {
                new OneButtonModal(this.advancedTexture, "Aucun programme à récupérer", "OK", () => {});
                return;
            } else {
                return console.info("no no program ( looked for ", this.loadedFile, " at island ", this.currentIsland, " found ", saved);
            }
        }
        const program = saved.program;
        if (!program) {
            if (manual) {
                new OneButtonModal(this.advancedTexture, "Aucun programme à récupérer", "OK", () => {});
                return;
            } else {
                return console.info("island data found but no program ( looked for ", this.loadedFile, " at island ", this.currentIsland, " found ", saved);
            }
        }
        this.isRestoring = true;
        console.log("restoring program");

        const factories = this.levelReader.createFactories(this.ctx, this) as any;
        const allFactories = {
            ...factories.instructions,
            ...factories.structures,
            ...factories.sensors,
            ...factories.ops,
            ...factories.booleans,
            start: (root: any, content_root: any) => new FlagContainer(root, content_root, this)
        };

        const children = [...this.workspace.getContentRoot().children];
        for (const child of children) {
            child.dispose();
        }
        this.workspace.getContentRoot().clearControls();

        for (const listData of program) {
            const list = this.buildList(listData.insts, allFactories);
            list.moveMagnet(list.getList().length - 1);
            list.leftInPixels = listData.x;
            list.topInPixels = listData.y;
            //list.reparent(list, this.workspace.getContentRoot(), new Vector2(listData.x, listData.y));
        }
        this.toolbox.rebuildVariables(this, this.ctx);

        this.updateInstructionCount();
        this.isRestoring = false;
    }

    private buildBlock(blockData: any, allFactories: any): BlocContainer | null {
        if (!blockData || !blockData.type) return null;

        if (blockData.type === "raw_value") {
            return null; 
        }

        let blockInstance;
        if (blockData.type === "var_value") {
            this.toolbox.addVariable(blockData.variable ?? "PB", this, this.ctx, true /*callFromRestore*/);
            blockInstance = new VarValueContainer(blockData.variable ?? "PB", this.leftPanel, this.workspace.getContentRoot(), this);
        } else {
            console.log("using factory to build ", blockData.type);
            const factory = allFactories[blockData.type];
            if (!factory) {
                console.error(`zerou factory pour le type de bloc: ${blockData.type}`);
                return null;
            }

            blockInstance = factory(this.leftPanel, this.workspace.getContentRoot());
        }

        this.leftPanel.removeControl(blockInstance);
        this.workspace.getContentRoot().addControl(blockInstance);

        new DragBehavior(blockInstance);
        
        let actualBlock: BlocContainer | null = null;
        if (blockInstance instanceof BlocContainer) {
            actualBlock = blockInstance;
        } else if (blockInstance instanceof InstructionContainer) {
            actualBlock = blockInstance.bloc;
        } else if (blockInstance instanceof ListContainer) {
            const targetInst = blockInstance.getList().find(e => e instanceof InstructionContainer) as InstructionContainer;
            if (targetInst) actualBlock = targetInst.bloc;
        }

        if (!actualBlock) return null;

        if (blockData.variable) {
            if (typeof (actualBlock as any).setVarName === "function") {
                (actualBlock as any).setVarName(blockData.variable);
            }
        }

        if (blockData.children && Array.isArray(blockData.children)) {
            const slots = actualBlock.getSlots(); 
            
            for (let i = 0; i < blockData.children.length; i++) {
                const childData = blockData.children[i];
                if (!childData) continue; 

                const slotWrapper = slots[i];
                if (!slotWrapper) continue;

                if (childData.type === "raw_value" && childData.value !== undefined) {
                    //console.log("found a raw value noded !");
                    const inputSlot = slotWrapper.children[0];
                    if (inputSlot && inputSlot instanceof InputSlot) {
                        //console.log("restoring input slot value to ", childData.value);
                        (inputSlot as any).setValue(childData.value);
                    }
                } 
                else {
                    const childBlock = this.buildBlock(childData, allFactories);
                    if (childBlock) {
                        actualBlock.insertControlAt(childBlock, slotWrapper);
                    }
                }
            }
        }

        return actualBlock;
    }

    private buildList(program: InstructionData[], allFactories: any): ListContainer {
        const list = new ListContainer(this.leftPanel, this.workspace.getContentRoot(), this);
        
        for (const instrData of program) {
            if (!instrData.type) continue;

            let built;
            if (instrData.type === "set_var") {
                this.toolbox.addVariable(instrData.variable ?? "PB", this, this.ctx, true/*callFromRestore*/);
                built = new SetVarContainer(instrData.variable ?? "PB", this.leftPanel, this.workspace.getContentRoot(), this, this.ctx)
            } else {
                const factory = allFactories[instrData.type];
                if (!factory) continue;
                built = factory(this.leftPanel, this.workspace.getContentRoot());
            }

            if (built instanceof ListContainer) {
                if (instrData.condition) {
                    const instContainer = built.getList().find(e => e instanceof InstructionContainer) as InstructionContainer;
                    if (instContainer) {
                        const slots = instContainer.getSlots();
                        if (slots && slots.length > 0) {
                            if (instrData.condition.type === "raw_value" && instrData.condition.value !== undefined) {
                                //console.log("found a raw value noded !");
                                const inputSlot = slots[0]?.children[0];
                                if (inputSlot && inputSlot instanceof InputSlot) {
                                    //console.log("restoring input slot value to ", instrData.condition.value);
                                    (inputSlot as any).setValue(instrData.condition.value);
                                }
                            }
                            const childBlock = this.buildBlock(instrData.condition, allFactories);
                            if (childBlock) {
                                instContainer.bloc.insertControlAt(childBlock, slots[0]);
                            }
                        }
                    }
                }
                if (instrData.children1) {
                    const inner = this.buildList(instrData.children1, allFactories);
                    built.moveMagnet(1);
                    //console.log(built.getList().map(e => e.constructor.name));
                    built.mergeList(inner);
                    built.recomputeInstructions();
                }
                if (instrData.children2) {
                    const inner = this.buildList(instrData.children2, allFactories);
                    built.moveMagnet(built.getList().length - 2);
                    //console.log(built.getList().map(e => e.constructor.name));
                    built.mergeList(inner);
                    built.recomputeInstructions();
                }
                list.mergeList(built);
            } else if (built instanceof InstructionContainer) {
                if (instrData.condition) { 
                    const slots = built.getSlots();
                    if (slots && slots.length > 0) {
                        if (instrData.condition.type === "raw_value" && instrData.condition.value !== undefined) {
                                //console.log("found a raw value noded !");
                                const inputSlot = slots[0]?.children[0];
                                if (inputSlot && inputSlot instanceof InputSlot) {
                                    //console.log("restoring input slot value to ", instrData.condition.value);
                                    (inputSlot as any).setValue(instrData.condition.value);
                                }
                        }   
                        const childBlock = this.buildBlock(instrData.condition, allFactories);
                        if (childBlock) built.bloc.insertControlAt(childBlock, slots[0]);
                    }
                } else if (instrData.data) {
                    const slots = built.getSlots();
                    if (slots && slots.length > 0) {
                        if (instrData.data.type === "raw_value" && instrData.data.value !== undefined) {
                                //console.log("found a raw value noded !");
                                const inputSlot = slots[0]?.children[0];
                                if (inputSlot && inputSlot instanceof InputSlot) {
                                    //console.log("restoring input slot value to ", instrData.data.value);
                                    (inputSlot as any).setValue(instrData.data.value);
                                }
                        }
                        const childBlock = this.buildBlock(instrData.data, allFactories);
                        if (childBlock) built.bloc.insertControlAt(childBlock, slots[0]);
                    }
                }
                list.addInstruction(built, list.getMagnetID());
            }
        }
        this.leftPanel.removeControl(list);
        this.workspace.getContentRoot().addControl(list);
        return list;
    }

    public getCtx() { return this.ctx; }

    public dispose() {
        console.log("playscene dispose called");
        window.clearInterval(this.saveInterval);
        this.saveProgram();
    }
}