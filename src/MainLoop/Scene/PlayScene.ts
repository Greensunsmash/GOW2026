import { ArcRotateCamera, Color3, CubeTexture, DefaultRenderingPipeline, DirectionalLight, Engine, IblShadowsRenderPipeline, KeyboardEventTypes, MeshBuilder, PBRMaterial, ShadowGenerator, Vector3, Viewport } from "@babylonjs/core";
import { ListContainer } from "../../Containers/ListContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { Level } from "../../Environment/Level";
import { LevelReader, State, type IslandMap, type ItemType } from "../../Environment/LevelReader";
import { Memory, type GameMode } from "../../Language/Memory";
import { QuitButton } from "../../MRGUI/buttons/QuitButton";
import { MainNavigator } from "../../MRGUI/mainscreen/MainNavigator";
import { OneButtonModal } from "../../MRGUI/windows/OneButtonModal";
import { ASSETS_ROOT, LayerMasks } from "../../Shared/Constants";
import { ExecutionContext } from "../ExecutionContext";
import { GameScene } from "./GameScene";
import { StructureContainer } from "../../Containers/StructureContainer";
import { BlockCount } from "../../MRGUI/mainscreen/BlockCount";
import { ItemsHUD } from "../../MRGUI/mainscreen/ItemsHUD";
import { BasicInstContainer } from "../../Containers/BasicInstContainer";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene { // ;)
    //private player: Player;

    private levelReader: LevelReader;
    private currentIsland: number = 0;
    private currentIslandMap: IslandMap;
    private currentLeaf: number = 19937572471;

    private ctx: ExecutionContext;
    private uiCamera: ArcRotateCamera;
    private mapCamera: ArcRotateCamera;
    public shadowGenerator: ShadowGenerator;

    private onLevelGaveup?: () => void;
    private onLevelWon?: () => void;

    private canRun: boolean = true;
    private dryAttemptMode: boolean = false;

    private blockCountDisp: BlockCount;
    private itemsHud: ItemsHUD;
    private mainNav: MainNavigator;

    private memory: Memory = Memory.get();

    constructor(engine: Engine) {
        super(engine);
        this.currentLeaf = this.currentLeaf * 2 - (this.currentLeaf + this.currentLeaf);
        this.mainNav = new MainNavigator(
            this.leftPanel,
            () => {},
            () => this.stepBack(),
            () => this.nextStep(),
            () => {},
            () => this.previousLeaf(),
            () => this.nextLeaf(true),
            () => this.dryAttempt(),
            () => this.attemptAllLeafs()
        );
        this.blockCountDisp = new BlockCount(this.leftPanel);
        this.itemsHud = new ItemsHUD(this.leftPanel);
        //this.init();
    }

    update(): void {
        //this.player.update();
    }

    async init(levelName: string | undefined = "level1.json", onLevelGaveup?: () => void, onLevelWon?: () => void) {
        await this.initGameScene(levelName);

        this.advancedTexture.addControl(this.blockCountDisp);
        this.advancedTexture.addControl(this.itemsHud);
        this.advancedTexture.addControl(this.mainNav);
        this.advancedTexture.addControl(
            new QuitButton(this.leftPanel, () => {
                if (onLevelGaveup)
                    onLevelGaveup();
            })
        );

        this.scene.onKeyboardObservable.add((kbInfo) => {
            console.log("key event", kbInfo.event.key);
            if (kbInfo.type == KeyboardEventTypes.KEYUP) {
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
                }

            }
        });

        this.onLevelGaveup = onLevelGaveup;
        this.onLevelWon = onLevelWon;
    }

    async initGameScene(levelName: string) {
        this.scene.getEngine().displayLoadingUI();

        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;
        this.mapCamera = new ArcRotateCamera("mapCamera", Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), this.scene);
        this.mapCamera.viewport = new Viewport(0.5, 0, 0.5, 1.0);
        this.mapCamera.layerMask = LayerMasks.SCENE_ONLY;

        this.mapCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        this.mapCamera.upperBetaLimit = Math.PI / 2.5;
        this.mapCamera.lowerRadiusLimit = 10;
        this.mapCamera.upperRadiusLimit = 25;

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.mapCamera);
        this.scene.activeCameras.push(this.uiCamera);
        this.addDetachControlObservables();

        this.fillBelow();
        this.setupSkybox();
        this.setupShadows();
        this.setupThePipeToTheline();

        await this.loadAssets();
        this.levelReader = new LevelReader();
        await this.levelReader.loadLevel(levelName);
        await this.loadIsland(0);

        /* let light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.includeOnlyWithLayerMask = LayerMasks.SCENE_ONLY;
        light.intensity = 1.0; */

        this._isLoaded = true;
        this.scene.getEngine().hideLoadingUI();
    }

    private fillBelow() {
        let ground = MeshBuilder.CreateGround("ground", { width: 512, height: 512, subdivisions: 32 }, this.scene);

        const waterMat = new PBRMaterial("waterMat", this.scene);
        waterMat.albedoColor = new Color3(0.01, 0.05, 0.08);
        waterMat.alpha = 0.6;
        waterMat.metallic = 0.0;
        waterMat.roughness = 0.1;

        ground.material = waterMat;
        ground.layerMask = LayerMasks.SCENE_ONLY;
        ground.position.y = 0.35;
    }

    private setupSkybox() {
        const texture = new CubeTexture(ASSETS_ROOT + "/skybox/moon.env", this.scene);
        texture.level = 1.0;
        this.scene.environmentTexture = texture;
        this.scene.imageProcessingConfiguration.exposure = 1.0;
        this.scene.environmentIntensity = 1.0;
        // Create a skybox mesh using this texture
        const skybox = this.scene.createDefaultSkybox(texture, true, 100000, 0);
    }

    private setupShadows() {
        // ca marchait pas bien du cp j'ai enlevé
    }

    private setupThePipeToTheline() {
        
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
        this.mainNav.updateLeafIndicator(`Feuille ${index + 1}/${this.currentIslandMap.length}`)

        this.currentLeaf = index;
        this.canRun = false; // hop on arrete d'exécuter

        if (this.level) this.level.dispose();

        const map = this.currentIslandMap[index];
        this.level = new Level(map, this._drh, this.scene);
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
        this.ctx.setGoals(new_goals);

        this.ctx.getRobot().setOnItemsChange((items: ItemType[]) => {
            this.itemsHud.setItems(items);
        });

        this.updateInstructionCount();
    }

    // Renvoie true si on a bien changé de leaf,
    // false si on était deja a la derniere
    public async nextLeaf(manual: boolean = false): Promise<boolean> {
        const next = this.currentLeaf + 1;

        if (next >= this.currentIslandMap.length) {
            console.log("Dernière feuille atteinte");
            if (!manual) {
                console.log(this.levelReader.getEndDialog(this.currentIsland));
                new OneButtonModal(
                    this.advancedTexture,
                    this.levelReader.getEndDialog(this.currentIsland) || "Ile terminée !",
                    "Continuer",
                    async () => await this.nextIsland()
                );
            } else {
                new OneButtonModal(
                    this.advancedTexture,
                    "Dernière feuille",
                    "Fermer",
                    () => { }
                );
            }
            return false;
        }

        await this.loadLeaf(next);
        return true;
    }

    public async previousLeaf() {
        const prev = this.currentLeaf - 1;
        if (prev < 0) {
            new OneButtonModal(
                this.advancedTexture,
                "Plus d'autre feuille",
                "Fermer",
                () => { }
            );
            return;
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
        //this.ctx = new ExecutionContext(this.level.getRobot(), this);
        this.levelReader.setupToolbox(index, this.toolbox, this.ctx, this);
        this.blockCountDisp.setLimit(this.levelReader.getBlockLimitForIsland(this.currentIsland));

        this.mainNav.buildNavigator(this.currentIslandMap.length >= 2);

        const beginDialog = this.levelReader.getBeginDialog(this.currentIsland);
        if (beginDialog) {
            new OneButtonModal(
                this.advancedTexture,
                beginDialog,
                "Let's go",
                () => { }
            );
        }
    }

    public async nextIsland() {
        const next = this.currentIsland + 1;

        if (next >= (this.levelReader as any).structure.length) {
            console.log("Dernière île atteinte");
            new OneButtonModal(
                this.advancedTexture,
                "Niveau réussi !",
                "Menu",
                () => { if (this.onLevelWon) this.onLevelWon() }
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
            this._drh.loadSingleAsset("robot", "character-male-e.glb"),
            this._drh.loadSingleAsset("ground", "grasscube.glb"),
            this._drh.loadSingleAsset("cursed", "cube.glb"),
            this._drh.loadSingleAsset("wall", "stone.02.glb"),
            this._drh.loadSingleAsset("pill", "pill.glb"),
            this._drh.loadSingleAsset("heart", "heart.01.glb"),
            this._drh.loadSingleAsset("river", "water.glb"),
            this._drh.loadSingleAsset("pig", "cubepets/animal-pig.glb"),
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

    public run(onlyOneStep: boolean = false) {
        Memory.get().clear();
        console.log("Avant le run");
        Memory.print()
        this.level.reinitLevel();
        this.canRun = true;
        Memory.get().setPlaying(!onlyOneStep);
        const prevLeafIndex = this.currentLeaf;

        // "Compilation" :

        let child_list = this.leftPanel.children;
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

    public stepBack() {
        this.memory.stepBack();
    }


    public nextStep(){
        console.log("TRYING to run next step");
        console.log(this.memory.getCurrentInstruction());
        if (!(this.memory.hasRan()) || !(this.memory.getCurrentInstruction())) {
            console.log("running scene.run");
            this.run(true);
        } else
            this.memory.nextStep();
    }

    public stopRun() {
        this.canRun = false;
        this.memory.setPlaying(false);
    }

    public async attemptAllLeafs() {
        if (this.currentLeaf != 0) {
            await this.loadLeaf(0);
        }
        this.dryAttemptMode = false;
        this.scene.onAfterRenderObservable.addOnce(async () => await this.run());
    }

    public async dryAttempt() {
        console.log("scene.dryAttempt");
        this.dryAttemptMode = true;
        await this.run();
        this.dryAttemptMode = false;
    }

    public isDryAttempt(): boolean {
        return this.dryAttemptMode;
    }

    
    public async onGoalReached() {
        this.stopRun();
        if (this.isDryAttempt()) {
            console.log("dry attempt success");
            new OneButtonModal(
                this.advancedTexture,
                "Objectif atteint",
                "Fermer",
                () => {}
            );
        } else {
            const isAnotherLeafLeft = await this.nextLeaf();
            // si je mets pas ce delay ca marche pas..
            // a investiguer 
            //await new Promise((rs, rj) => setTimeout(rs, 500));
            if (isAnotherLeafLeft)
                this.scene.onAfterRenderObservable.addOnce(async () => await this.run());
        }
    }

    public onGoalUnreached() {
        this.stopRun();
        new OneButtonModal(
            this.advancedTexture,
            "Objectif non atteint",
            "Réessayer",
            () => { }
        );
    }

    public onRobotDead() {
        this.stopRun();
        new OneButtonModal(
            this.advancedTexture,
            "Vous êtes mort.",
            "Je suis Jésus",
            () => { }
        );
    }

    // le compteur incrém/décrém n'était pas une solution fiable
    public override updateInstructionCount() {
        let child_list = this.leftPanel.children;
        let count = 0;
        for (const child of child_list) {
            if (child instanceof ListContainer) {   
                count += child.getInstructionCount();
            }
        } 
        console.log("new instruction count is : ", count);
        this.blockCount = count;
        this.blockCountDisp.setBlockCount(count);
    }

    public modeUpdate() {
        this.toolbox.onModeChange();
        let child_list = this.leftPanel.children;
        for (const child of child_list) {
            if (child instanceof ListContainer) {   
                const insts = child.getInnerInstContainers();
                for (const inst of insts) {
                    if (inst instanceof BasicInstContainer)
                        inst.triggerModeUpdate();
                }
            }
        } 
    }
}