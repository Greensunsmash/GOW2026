import { KeyboardEventTypes, ThinBlackAndWhitePostProcess } from "@babylonjs/core";
import { ArcRotateCamera, Engine, HemisphericLight, Vector3, Viewport } from "@babylonjs/core";
import { GameScene } from "./GameScene";
import { Level } from "../../Environment/Level";
import { LevelReader, State } from "../../Environment/LevelReader";
import { LayerMasks } from "../../Shared/Constants";
import { StartButton } from "../../MRGUI/buttons/StartButton";
import { GridUtils } from "../../Shared/GridUtils";
import { ExecutionContext, type Goal } from "../ExecutionContext";
import { StackPanel } from "@babylonjs/gui";
import { QuitButton } from "../../MRGUI/buttons/QuitButton";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    private levelReader: LevelReader;
    private currentIsland: number = 0;

    private ctx: ExecutionContext;
    private uiCamera: ArcRotateCamera;
    private mapCamera: ArcRotateCamera;

    private onLevelGaveup?: () => void;
    private onLevelWon?: () => void; 

    constructor(engine: Engine) {
        super(engine);
        this.init();
    }

    update(): void {
        //this.player.update();
    }

    async init(levelName: string | undefined = "level1.json", onLevelGaveup?: () => void, onLevelWon?: () => void) {
        await this.initGameScene(levelName);

        this.advancedTexture.addControl(
            new StartButton(this.leftPanel, () => this.run())
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
                if (kbInfo.event.key == "ArrowRight") {
                    console.log("left");
                    this.nextIsland();
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

    public loadIsland(index: number) {
        const island = this.levelReader.getIsland(index);
        if (!island || island.length === 0) {
            throw new Error("Island not found or empty");
        }
        this.currentIsland = index;

        if (this.level) this.level.dispose();

        const map = island[0];
        this.level = new Level(map, this._drh, this.scene);

        if (this.ctx) this.ctx.newLevel(this.level.getRobot());
        else this.ctx = new ExecutionContext(this.level.getRobot(), this);

        const new_goal = this.levelReader.getGoal(index);
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

        this.levelReader.setupToolbox(index, this.toolbox, this.ctx, this);
    }

    public nextIsland() {
        const next = this.currentIsland + 1;

        if (next >= (this.levelReader as any).structure.length) {
            console.log("Dernière île atteinte");
            if (this.onLevelWon) 
                this.onLevelWon();
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
}