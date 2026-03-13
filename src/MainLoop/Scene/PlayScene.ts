import { Camera, Engine, HemisphericLight, Vector3 } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import { BasicInstContainer } from "../../Containers/BasicInstContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { MoveBackwardInstuction } from "../../Language/Instructions/MoveBackwardInstruction";
import { MoveForwardInstuction } from "../../Language/Instructions/MoveForwardInstruction";
import { TurnLeftInstruction } from "../../Language/Instructions/TurnLeftInstruction";
import { TurnRightInstruction } from "../../Language/Instructions/TurnRightInstruction";
import { LayerMasks } from "../../Shared/Constants";
import type { ExecutionContext } from "../../Shared/types";
import { ListContainer } from "../../Containers/ListContainer";
import { PourContainer } from "../../Containers/Prefabs/PourContainer";
import { SiContainer } from "../../Containers/Prefabs/SiContainer";
import type { Container } from "@babylonjs/gui";
import { InfContainer } from "../../Containers/Prefabs/InfContainer";
import { SupContainer } from "../../Containers/Prefabs/SupContainer";
import { EgalContainer } from "../../Containers/Prefabs/EgalContainer";
import { SetVarContainer } from "../../Containers/Prefabs/SetVarContainer";
import { VarValueContainer } from "../../Containers/Prefabs/VarValueContainer";
import { BooleenBrutContainer } from "../../Containers/Prefabs/BooleenBrutContainer";
import { PrintContainer } from "../../Containers/Prefabs/PrintContainer";
import { MoinsContainer } from "../../Containers/Prefabs/MoinsContainer";
import { PlusContainer } from "../../Containers/Prefabs/PlusContainer";
import { FonctionContainer } from "../../Containers/Prefabs/FonctionContainer";
import { ExeFonctionContainer } from "../../Containers/Prefabs/ExeFonctionContainer";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    
    private level : Level;
    private ctx: ExecutionContext;

    constructor(engine: Engine) {
        super(engine);
        
        /* 
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

        this.init();
    }

    update(): void {
        //this.player.update();
    }

    async init() {
        await this.initGameScene();
        this.ctx = {robot: this.level.getRobot()};
        this.setupOutilsBox();
    }

    setupOutilsBox() {
        // Instructions (violet)
        this.toolbox.addCategory("Instructions", "#8727F5");
        this.toolbox.addTemplate("Instructions", (root: Container) => new BasicInstContainer(
            "Avancer d'une case", 
            new MoveForwardInstuction(this.ctx),
            root, 
            this
        ));
        this.toolbox.addTemplate("Instructions", (root: Container) => new BasicInstContainer(
            "Reculer d'une case", 
            new MoveBackwardInstuction(this.ctx),
            root, 
            this
        ));
        this.toolbox.addTemplate("Instructions", (root: Container) => new BasicInstContainer(
            "Tourner à gauche", 
            new TurnLeftInstruction(this.ctx),
            root, 
            this
        ));
        this.toolbox.addTemplate("Instructions", (root: Container) => new BasicInstContainer(
            "Tourner à droite", 
            new TurnRightInstruction(this.ctx),
            root, 
            this
        ));
        this.toolbox.addTemplate("Instructions", (root: Container) => new PrintContainer(root, this));
        this.toolbox.addTemplate("Instructions", (root: Container) => new SetVarContainer("x", root, this));

        // Structures (violet)
        this.toolbox.addCategory("Structures", "#8727F5");
        this.toolbox.addTemplate("Structures", (root: Container) => {
            const l = new ListContainer(root, this);
            const pour = new PourContainer(l, root, this);
            l.addInstruction(pour.getQueue(), 0);
            l.addInstruction(pour.getHeader(), 0);
            l.addStruct(pour);
            return l;
        }); 
        this.toolbox.addTemplate("Structures", (root: Container) => {
            const l = new ListContainer(root, this);
            const si = new SiContainer(l, root, this);
            l.addInstruction(si.getQueue(), 0);
            l.addInstruction(si.getHeader(), 0);
            l.addStruct(si);
            return l;
        });

        // Booleens (orange)
        this.toolbox.addCategory("Booléens", "#95F527", true);
        this.toolbox.addTemplate("Booléens", (root: Container) => new BooleenBrutContainer(true, root, this));
        this.toolbox.addTemplate("Booléens", (root: Container) => new BooleenBrutContainer(false, root, this));
        this.toolbox.addTemplate("Booléens", (root: Container) => new InfContainer(root, this));
        this.toolbox.addTemplate("Booléens", (root: Container) => new SupContainer(root, this));
        this.toolbox.addTemplate("Booléens", (root: Container) => new EgalContainer(root, this));

        // Variables et opérations (vert)
        this.toolbox.addCategory("Variables et opérations", "#F58727", true);
        this.toolbox.addTemplate("Variables et opérations", (root: Container) => new VarValueContainer("x", root, this));
        this.toolbox.addTemplate("Variables et opérations", (root: Container) => new MoinsContainer(root, this));
        this.toolbox.addTemplate("Variables et opérations", (root: Container) => new PlusContainer(root, this));

        // Fonctions (violet puis rose)
        this.toolbox.addCategory("Fonctions", "#F52795");
        this.toolbox.addTemplate("Fonctions", (root: Container) => new FonctionContainer("Multiplication", ["x", "y"], root, this));
        this.toolbox.addTemplate("Fonctions", (root: Container) => new ExeFonctionContainer("Multiplication", 2, root, this));

        // Départ (rose)
        this.toolbox.addCategory("Départ", "#F52795");
        this.toolbox.addTemplate("Départ", (root: Container) => new FlagContainer(root, this));

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

    run() {}
}