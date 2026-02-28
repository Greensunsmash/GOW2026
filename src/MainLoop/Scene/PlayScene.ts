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
import { PourContainer } from "../../Containers/Prefabs/PourContainer";
import { PrintContainer } from "../../Containers/Prefabs/PrintContainer";
import { ValeurBruteContainer } from "../../Containers/Prefabs/ValeurBruteContainer";
import { PlusContainer } from "../../Containers/Prefabs/PlusContainer";
import { Flag } from "../../Language/Group/Depart/Flag";
import { Print } from "../../Language/Instructions/Print";
import { ValeurBrute } from "../../Language/Valeur/ValeurBrute";
import { Pour } from "../../Language/Group/Structure/Pour";
import { MoinsContainer } from "../../Containers/Prefabs/MoinsContainer";
import { SiContainer } from "../../Containers/Prefabs/SiContainer";
import { BooleenBrut } from "../../Language/Booleen/BooleenBrute";
import { BooleenBrutContainer } from "../../Containers/Prefabs/BooleenBrutContainer";
import { Egal } from "../../Language/Booleen/Egal";
import { EgalContainer } from "../../Containers/Prefabs/EgalContainer";
import { InfContainer } from "../../Containers/Prefabs/InfContainer";
import { SupContainer } from "../../Containers/Prefabs/SupContainer";
import { SetVarContainer } from "../../Containers/Prefabs/SetVarContainer";
import { VarValueContainer } from "../../Containers/Prefabs/VarValueContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { FonctionContainer } from "../../Containers/Prefabs/FonctionContainer";
import { ExeFonction } from "../../Language/Instructions/ExeFonction";
import { ExeFonctionContainer } from "../../Containers/Prefabs/ExeFonctionContainer";
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
        l.addInstruction(new ExeFonctionContainer("Multiplication", 2, this.leftPanel, this), 1);

        new PlusContainer(this.leftPanel, this);
        new MoinsContainer(this.leftPanel, this);
        new ValeurBruteContainer(4, this.leftPanel, this);
        new ValeurBruteContainer(4, this.leftPanel, this);
        new ValeurBruteContainer(2, this.leftPanel, this);
        new ValeurBruteContainer(1, this.leftPanel, this);

        new BooleenBrutContainer(true, this.leftPanel, this);
        new EgalContainer(this.leftPanel, this);
        new InfContainer(this.leftPanel, this);
        new SupContainer(this.leftPanel, this);
        new VarValueContainer("x", this.leftPanel, this);
        new VarValueContainer("y", this.leftPanel, this);

        /*
        let f = new Flag([new Pour(new Print(new ValeurBrute("hehe")), new ValeurBrute(2))]);
        f.onLaunch();
        f.execute([]);
        */
        /*
        let l = new ListContainer(this.leftPanel, this);
        let s = new StructureContainer(l, this.leftPanel, this);
        let s2 = new StructureContainer(l, this.leftPanel, this);
        let i1 = s.getHeader();
        let i2 = s.getQueue();
        let i3 = s2.getHeader();
        let i4 = s2.getQueue();
        l.addInstruction(i1, 0);
        l.addInstruction(i2, 1);
        l.addStruct(s);
        l.addInstruction(i3, 1);
        l.addInstruction(i4, 2);
        l.addStruct(s2);
        l.addInstruction(new InstructionContainer(["Contenu"], this.leftPanel, this), 1);
        l.addInstruction(new InstructionContainer(["Contenu"], this.leftPanel, this), 1);
        l.addInstruction(new InstructionContainer(["Contenu2"], this.leftPanel, this), 4);
        l.addInstruction(new InstructionContainer(["Avant"], this.leftPanel, this), 0);
        l.addInstruction(new InstructionContainer(["Après"], this.leftPanel, this), 9);
        l.addInstruction(new DepartContainer(["Première instruction"], this.leftPanel, this), 0);
        */
                

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