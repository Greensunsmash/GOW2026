import { ArcRotateCamera, Engine, HemisphericLight, KeyboardEventTypes, Vector3, Viewport } from "@babylonjs/core";
import { Level } from "../../Environment/Level";
import { LevelReader, State, type IslandMap } from "../../Environment/LevelReader";
import { QuitButton } from "../../MRGUI/buttons/QuitButton";
import { StartButton } from "../../MRGUI/buttons/StartButton";
import { LayerMasks } from "../../Shared/Constants";
import { ExecutionContext } from "../ExecutionContext";
import { GameScene } from "./GameScene";
import { Memory } from "../../Language/Memory";
import { ListContainer } from "../../Containers/ListContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { OneButtonModal } from "../../MRGUI/windows/OneButtonModal";
import { CDPlaybar } from "../../MRGUI/CDPlaybar";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    private levelReader: LevelReader;
    private currentIsland: number = 0;
    private currentIslandMap: IslandMap;
    private currentLeaf: number = 0;

    private ctx: ExecutionContext;
    private uiCamera: ArcRotateCamera;
    private mapCamera: ArcRotateCamera;

    private onLevelGaveup?: () => void;
    private onLevelWon?: () => void; 

    private canRun: boolean = true;
    private dryAttemptMode: boolean = false;

    constructor(engine: Engine) {
        super(engine);
        this.init();
    }

    update(): void {
        //this.player.update();
    }

    async init(levelName: string | undefined = "level1.json", onLevelGaveup?: () => void, onLevelWon?: () => void) {
        await this.initGameScene(levelName);

        this.leftPanel.addControl(
            //new StartButton(this.leftPanel, () => this.attemptAllLeafs())
            new CDPlaybar(
                this.leftPanel,
                () => this.ctx.stepBack(),
                () => this.ctx.nextStep(),
                () => this.dryAttempt(),
                () => this.attemptAllLeafs()
            )
        );
        this.advancedTexture.addControl(
            new QuitButton(this.leftPanel, () => {
                if (onLevelGaveup) 
                    onLevelGaveup();
            })
        );

        this.scene.onKeyboardObservable.add((kbInfo) =>{
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
                    this.ctx.stepBack();
                } else if (kbInfo.event.key == "f") {
                    console.log("nextstep");
                    this.ctx.nextStep();
                }
                
            }
        });

        this.onLevelGaveup = onLevelGaveup;
        this.onLevelWon = onLevelWon;
    }

    async initGameScene(levelName: string) {
        this.scene.getEngine().displayLoadingUI();
        
        this.uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.uiCamera.layerMask = LayerMasks.UI_ONLY;
        this.mapCamera = new ArcRotateCamera("mapCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.scene);
        this.mapCamera.viewport = new Viewport(0.5, 0, 0.5, 1.0);
        this.mapCamera.layerMask = LayerMasks.SCENE_ONLY;

        this.mapCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);

        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.mapCamera);
        this.scene.activeCameras.push(this.uiCamera);
        this.addDetachControlObservables();
        
        await this.loadAssets();
        this.levelReader = new LevelReader();
        await this.levelReader.loadLevel(levelName);
        this.loadIsland(0);

        let light = new HemisphericLight("light", new Vector3(0,1,0), this.scene);
        light.includeOnlyWithLayerMask = LayerMasks.SCENE_ONLY;
        light.intensity = 1.0;

        this._isLoaded = true;
        this.scene.getEngine().hideLoadingUI();
    }

    public loadLeaf(index: number) {
        this.currentLeaf = index;
        this.canRun = false; // hop on arrete d'exécuter

        if (this.level) this.level.dispose();

        const map = this.currentIslandMap[index];
        this.level = new Level(map, this._drh, this.scene);

        if (this.ctx) this.ctx.newLevel(this.level.getRobot());
        else this.ctx = new ExecutionContext(this.level.getRobot(), this);

        const new_goal = this.levelReader.getGoal(this.currentIsland);
        switch (new_goal.name) {
            case "arrival" :
                const flagPos = this.level.findStatePos(State.Flag);
                if (flagPos)
                    new_goal.args = {flagPos: flagPos}; 
                else
                    throw new Error("cant set an arrival goal without any flag in the leaf map !");
                break;
            default :
                throw new Error("Goal Inconnu");
        }
        this.ctx.setGoal(new_goal);
    }

    public nextLeaf() {
        const next = this.currentLeaf + 1;

        if (next >= this.currentIslandMap.length) {
            console.log("Dernière feuille atteinte");
            new OneButtonModal(
                this.advancedTexture, 
                "Ile terminée !",
                "Continuer",
                () => this.nextIsland()
            );
            return;
        }

        this.loadLeaf(next);
    }

    public previousLeaf() {
        const prev = this.currentLeaf - 1;
        if (prev < 0) return;
        this.loadLeaf(prev);
    }

    public loadIsland(index: number) {
        const island = this.levelReader.getIsland(index);
        if (!island || island.length === 0) {
            throw new Error("Island not found or empty");
        }
        this.currentIsland = index;
        this.currentIslandMap = island;

        this.loadLeaf(0);

        this.toolbox.clear();
        this.ctx = new ExecutionContext(this.level.getRobot(), this);
        this.levelReader.setupToolbox(index, this.toolbox, this.ctx, this);
    }

    public nextIsland() {
        const next = this.currentIsland + 1;

        if (next >= (this.levelReader as any).structure.length) {
            console.log("Dernière île atteinte");
            new OneButtonModal(
                this.advancedTexture,
                "Niveau réussi !",
                "Menu",
                () => {if (this.onLevelWon) this.onLevelWon()}
            );
            return;
        }

        this.loadIsland(next);
    }

    public previousIsland() {
        const prev = this.currentIsland - 1;
        if (prev < 0) return;
        this.loadIsland(prev);
    }

    async loadAssets() {    
        await Promise.all([
            this._drh.loadSingleAsset("robot", "robot.glb"),
            this._drh.loadSingleAsset("wall", "cube.glb"),
            this._drh.loadSingleAsset("pill", "pill.glb"),
            this._drh.loadSingleAsset("heart", "heart.01.glb"),
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

    public async run() {
        Memory.get().clear();
        this.level.reinitLevel();
        this.canRun = true;
        const prevLeafIndex = this.currentLeaf;

        // "Compilation" :
        // on remplit l'history avec les instructions visuelles à éxécuter

        let child_list = this.leftPanel.children;
        let start_block : ListContainer | undefined;

        for (const child of child_list) {
            if (child instanceof ListContainer) {
                if (!child.isFirst()) continue;
                if (child.getFirst() instanceof FlagContainer) start_block = child;
                else if (!child.getInstructionGroup()?.onLaunch()) throw new Error("error 404 Il y a eu une erreur au lancement");
            }
        }

        if (start_block) {
            const grp = start_block.getInstructionGroup();
            if (grp && grp.onLaunch()) grp.execute([]);
            else throw new Error("error 406 Il y a eu une erreur au lancement");
        }

        console.log(Memory.get().getHistory());

        // Exécution (évidemment c pas fini)

        while (await this.ctx.nextStep(false) && this.canRun);
        // et du coup à partir de là c ultra facile de faire du step by step complet

        if (this.canRun && this.currentLeaf == prevLeafIndex) {
            new OneButtonModal(
                this.advancedTexture,
                "Objectif non atteint",
                "Réessayer",
                () => {}
            );
        }
    }

    public stopRun() {
        this.canRun = false;
    }

    public async attemptAllLeafs() {
        if (this.currentLeaf != 0)
            this.loadLeaf(0);
        this.dryAttemptMode = false;
        await this.run();
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
}