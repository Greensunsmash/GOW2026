import { Camera, Engine, HemisphericLight, TubeBuilder, Vector3 } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import * as GUI from "@babylonjs/gui";
import { BasicInstContainer } from "../../Containers/BasicInstContainer";
import { ListContainer } from "../../Containers/ListContainer";
import { BooleenBrutContainer } from "../../Containers/Prefabs/BooleenBrutContainer";
import { EgalContainer } from "../../Containers/Prefabs/EgalContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { InfContainer } from "../../Containers/Prefabs/InfContainer";
import { MoinsContainer } from "../../Containers/Prefabs/MoinsContainer";
import { PlusContainer } from "../../Containers/Prefabs/PlusContainer";
import { PourContainer } from "../../Containers/Prefabs/PourContainer";
import { SupContainer } from "../../Containers/Prefabs/SupContainer";
import { ValeurBruteContainer } from "../../Containers/Prefabs/ValeurBruteContainer";
import { VarValueContainer } from "../../Containers/Prefabs/VarValueContainer";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { MoveForwardInstuction } from "../../Language/Instructions/MoveForwardInstruction";
import { LayerMasks } from "../../Shared/Constants";
import type { ExecutionContext } from "../../Shared/types";
import { MoveBackwardInstuction } from "../../Language/Instructions/MoveBackwardInstruction";
import { TurnLeftInstruction } from "../../Language/Instructions/TurnLeftInstruction";
import { TurnRightInstruction } from "../../Language/Instructions/TurnRightInstruction";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    
    private level : Level;
    protected advancedTexture: GUI.AdvancedDynamicTexture;
    protected leftPanel: GUI.Rectangle;
    private ctx: ExecutionContext;

    constructor(engine: Engine) {
        super(engine);

        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        if (this.advancedTexture.layer) {
            this.advancedTexture.layer.layerMask = LayerMasks.UI_ONLY;
        }   

        this.leftPanel = new GUI.Rectangle();
        this.leftPanel.width = "50%";
        this.leftPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.leftPanel.background = "#222222"; // Couleur de fond pour bien séparer
        this.advancedTexture.addControl(this.leftPanel);
        
        
        /*
        let l2 = new ListContainer(this.leftPanel, this);
        l2.addInstruction(new FonctionContainer("Multiplication", ["x", "y"], this.leftPanel, this), 0);
        let pour = new PourContainer(l, this.leftPanel, this);
        let si = new SiContainer(l, this.leftPanel, this);
        l.addInstruction(pour.getQueue(), 0);
        l.addInstruction(si.getQueue(), 0);
        l.addInstruction(new PrintContainer(this.leftPanel, this), 0);
        l.addInstruction(si.getHeader(), 0);
        l.addInstruction(pour.getHeader(), 0);
        l.addInstruction(new SetVarContainer("x", this.leftPanel, this), 0);
        l.addStruct(pour);
        l.addStruct(si);
        l.addInstruction(new FlagContainer(this.leftPanel, this), 0);
        l.addInstruction(new ExeFonctionContainer("Multiplication", 2, this.leftPanel, this), 1)
        */

        new ValeurBruteContainer(4, this.leftPanel, this);
        new ValeurBruteContainer(4, this.leftPanel, this);
        new ValeurBruteContainer(2, this.leftPanel, this);


        this.asyncInit();
    }

    update(): void {
        //this.player.update();
    }

    async asyncInit() {
        await this.initGameScene();
        this.ctx = {robot: this.level.getRobot()};
        let l = new ListContainer(this.leftPanel, this);
        let pour = new PourContainer(l, this.leftPanel, this);
        l.addInstruction(pour.getQueue(), 0);
        l.addInstruction(new BasicInstContainer(
            "Avancer d'une case", 
            new MoveForwardInstuction(this.ctx),
            this.leftPanel, 
            this
        ), 0);
        l.addInstruction(new BasicInstContainer(
            "Reculer d'une case", 
            new MoveBackwardInstuction(this.ctx),
            this.leftPanel, 
            this
        ), 0);
        l.addInstruction(new BasicInstContainer(
            "Tourner à gauche", 
            new TurnLeftInstruction(this.ctx),
            this.leftPanel, 
            this
        ), 0);
        l.addInstruction(new BasicInstContainer(
            "Tourner à droite", 
            new TurnRightInstruction(this.ctx),
            this.leftPanel, 
            this
        ), 0);
        l.addInstruction(pour.getHeader(), 0);
        l.addInstruction(new FlagContainer(this.leftPanel, this), 0);
        l.addStruct(pour);

    }

    async initGameScene() {
        this.scene.getEngine().displayLoadingUI();
        await this.loadAssets();
        let levelReader = new LevelReader();
        await levelReader.loadLevel("level0.json");
        const map = levelReader.getStructure();
        if (map.length == 0)
            throw new Error("level map is empty");
        this.level = new Level(map, this._drh, this.scene);
        let light = new HemisphericLight("light", new Vector3(0,1,0), this.scene);
        light.includeOnlyWithLayerMask = LayerMasks.SCENE_ONLY;
        light.intensity = 1.0;

        this._isLoaded = true;
        this.scene.getEngine().hideLoadingUI();
    }

    async loadAssets() {    
        await Promise.all([
            this._drh.loadSingleAsset("robot", "robot.glb"),
            this._drh.loadSingleAsset("wall", "cube.glb")
        ]);
    }

    addDetachControlObservables(engine: Engine, mapCamera: Camera) {
        this.leftPanel.onPointerEnterObservable.add(() => {
            mapCamera.detachControl();
        });

        this.leftPanel.onPointerOutObservable.add(() => {
            mapCamera.attachControl(engine.getRenderingCanvas(), true);
        });
    }

    run() {
        
    }
}