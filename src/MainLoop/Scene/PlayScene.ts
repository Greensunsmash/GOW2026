import { Engine, PointerEventTypes } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../../Containers/ValeurContainer";
import { BooleenContainer } from "../../Containers/BooleenContainer";
import { InstructionContainer } from "../../Containers/InstructionContainer";
import { StructureContainer } from "../../Containers/StructureContainer";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { DepartContainer } from "../../Containers/DepartContainer";
import { ListContainer } from "../../Containers/ListContainer";
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
        
        let l = new ListContainer(this.leftPanel, this);
        let i1 = new InstructionContainer(["Header"], this.leftPanel, this);
        let i2 = new InstructionContainer(["End"], this.leftPanel, this);
        let s = new StructureContainer(l, i1, i2);
        l.addInstruction(i1, 0);
        l.addInstruction(i2, 1);
        l.addStruct(s);
        l.addInstruction(new InstructionContainer(["Contenu"], this.leftPanel, this), 1);
        l.addInstruction(new InstructionContainer(["Contenu"], this.leftPanel, this), 1);
        l.addInstruction(new InstructionContainer(["Avant"], this.leftPanel, this), 0);
        l.addInstruction(new InstructionContainer(["Après"], this.leftPanel, this), 5);
                

        /* Ca marchait correctement mais c'est très très sale et pas extensible
        this.scene.onPointerObservable.add((pointerInfo) => { 
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                let evt = pointerInfo.event;
                let rec = this.getHoverSlot();
                if (rec instanceof ListContainer) rec.click(evt.x, evt.y);
            }
        });*/

        //new DepartContainer(["Au lancement du programme :"], this.leftPanel, this);
        /*
        new BooleenContainer(["", "v", " = ", "v"], this.leftPanel, this);
        new ValeurContainer(["10"], this.leftPanel, this);
        l.addInstruction(new InstructionContainer(["LALALAALALALALALALAL1", "v"], this.leftPanel, this), 0);
        l.addInstruction(new InstructionContainer(["LALALAALALALALALALAL2"], this.leftPanel, this), 1);
        l.addInstruction(new InstructionContainer(["LALALAALALALALALALAL3"], this.leftPanel, this), 2);
        l.addInstruction(new InstructionContainer(["LALALAALALALALALALAL4"], this.leftPanel, this), 3);
        l.addInstruction(new InstructionContainer(["LALALAALALALALALALAL5"], this.leftPanel, this), 4);
        */
        //let i = new StructureContainer(["Répéter", "v", "fois :"], this.leftPanel, this);
        //i.addNext(b);
        //new ValeurContainer(["10"], this.leftPanel, this);
        
        let levelReader = new LevelReader();
        this.level = new Level(levelReader.getStructure(), this.drh, this.scene);
    }

    update(): void {
        //this.player.update();
    }
}