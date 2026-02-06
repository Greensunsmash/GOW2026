import { Engine } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../../Containers/ValeurContainer";
import { BooleenContainer } from "../../Containers/BooleenContainer";
import { InstructionContainer } from "../../Containers/InstructionContainer";
import { StructureContainer } from "../../Containers/StructureContainer";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { DepartContainer } from "../../Containers/DepartContainer";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    
    private level : Level;
    protected advancedTexture: GUI.AdvancedDynamicTexture;
    protected leftPanel: GUI.Rectangle;

    constructor(engine: Engine) {
        super(engine);

        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.leftPanel = new GUI.Rectangle();
        this.leftPanel.width = "50%";
        this.leftPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.leftPanel.background = "#222222"; // Couleur de fond pour bien séparer
        this.advancedTexture.addControl(this.leftPanel);
    
        new DepartContainer(["Au lancement du programme :"], this.leftPanel, this);
        let i = new StructureContainer(["Répéter", "v", "fois :"], this.leftPanel, this);
        new BooleenContainer(["", "v", " = ", "v"], this.leftPanel, this);
        new ValeurContainer(["10"], this.leftPanel, this);
        new ValeurContainer(["10"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        new InstructionContainer(["LALALAALALALALALALAL"], this.leftPanel, this);
        //i.addNext(b);
        
        let levelReader = new LevelReader();
        this.level = new Level(levelReader.getStructure(), this.drh, this.scene);
    }

    update(): void {
        //this.player.update();
    }
}