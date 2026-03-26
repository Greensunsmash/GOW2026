import { KeyboardEventTypes } from "@babylonjs/core";
import { ArcRotateCamera, Engine, HemisphericLight, Vector3, Viewport } from "@babylonjs/core";
import { GameScene } from "./GameScene";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { LayerMasks } from "../../Shared/Constants";
import type { ExecutionContext } from "../../Shared/types";
import { StartButton } from "../../MRGUI/StartButton";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    private levelReader: LevelReader;
    private currentIsland: number = 0;

    private level : Level;
    private ctx: ExecutionContext;
    private uiCamera: ArcRotateCamera;
    private mapCamera: ArcRotateCamera;

    constructor(engine: Engine) {
        super(engine);
        this.init();
    }

    update(): void {
        //this.player.update();
    }

    async init() {
        await this.initGameScene();

        new StartButton(this.leftPanel, this);
        this.scene.onKeyboardObservable.add((kbInfo) =>{
            console.log("key event", kbInfo.event.key);
            if (kbInfo.type == KeyboardEventTypes.KEYUP) {
                if (kbInfo.event.key == "ArrowRight") {
                    console.log("left");
                    this.nextIsland();
                }
            }
        });
    }

    async initGameScene() {
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
        await this.levelReader.loadLevel("level1.json");
        this.loadIsland(0);
        /*
        if (map.length == 0)
            throw new Error("level map is empty");
        this.level = new Level(map, this._drh, this.scene);

        this.ctx = {robot: this.level.getRobot()};
        this.levelReader.setupToolbox(0, this.toolbox, this.ctx, this); */
        let light = new HemisphericLight("light", new Vector3(0,1,0), this.scene);
        light.includeOnlyWithLayerMask = LayerMasks.SCENE_ONLY;
        light.intensity = 1.0;

        this._isLoaded = true;
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        await sleep(1000);
        this.scene.getEngine().loadingScreen.loadingUIText = '<span style="font-size: 50px;">VOITURE BELIER PROD.</span><br>PRESENTS';
        await sleep(1000);
        this.scene.getEngine().loadingScreen.loadingUIText = '<span style="font-size: 80px;">MARCO ROBO :</span>';
        await sleep(1000);
        this.scene.getEngine().loadingScreen.loadingUIText = '<span style="font-size: 80px;">MARCO ROBO :</span><br>A LA RECHERCHE<br>DU DEMARREUR COSMIQUE PERDU';        
        await sleep(1000);
        
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
        this.ctx = { robot: this.level.getRobot() };
        this.levelReader.setupToolbox(index, this.toolbox, this.ctx, this);
    }

    public nextIsland() {
        const next = this.currentIsland + 1;

        if (next >= (this.levelReader as any).structure.length) {
            console.log("Dernière île atteinte");
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
            this._drh.loadSingleAsset("wall", "cube.glb")
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