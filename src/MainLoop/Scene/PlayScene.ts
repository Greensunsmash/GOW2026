import { Engine, HemisphericLight, Vector3 } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import * as GUI from "@babylonjs/gui";
import { BooleenContainer } from "../../Containers/BooleenContainer";
import { InstructionContainer } from "../../Containers/InstructionContainer";
import { StructureContainer } from "../../Containers/StructureContainer";
import { ValeurContainer } from "../../Containers/ValeurContainer";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { LayerMasks } from "../../Shared/Constants";
import { DepartContainer } from "../../Containers/DepartContainer";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    
    private _level : Level;
    protected _advancedTexture: GUI.AdvancedDynamicTexture;
    protected _leftPanel: GUI.Rectangle;

    constructor(engine: Engine) {
        super(engine);

        this._advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        if (this._advancedTexture.layer) {
            this._advancedTexture.layer.layerMask = LayerMasks.UI_ONLY;
        }   

        this._leftPanel = new GUI.Rectangle();
        this._leftPanel.width = "50%";
        this._leftPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._leftPanel.background = "#222222"; // Couleur de fond pour bien séparer
        this._advancedTexture.addControl(this._leftPanel);
    
        new DepartContainer(["Au lancement du programme :"], this.leftPanel, this);
        new BooleenContainer(["", "v", " = ", "v"], this.leftPanel, this);
        new ValeurContainer(["10"], this.leftPanel, this);
        new ValeurContainer(["10"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        let i = new StructureContainer(["Répéter", "v", "fois :"], this.leftPanel, this);
        //i.addNext(b);

        this.initGameScene();
    }

    update(): void {
        //this.player.update();
    }

    async initGameScene() {
        this.scene.getEngine().displayLoadingUI();
        await this.loadAssets();
        let levelReader = new LevelReader();
        await levelReader.loadLevel("level0.json");
        const map = levelReader.getStructure();
        if (map.length == 0)
            throw new Error("level map is empty");
        this._level = new Level(map, this._drh, this.scene);
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
}