import { ArcRotateCamera, Camera, Engine, HemisphericLight, Vector3, Viewport } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import { BasicBooleenContainer } from "../../Containers/BasicBooleenContainer";
import { BasicInstContainer } from "../../Containers/BasicInstContainer";
import { ListContainer } from "../../Containers/ListContainer";
import { BooleenBrutContainer } from "../../Containers/Prefabs/BooleenBrutContainer";
import { EgalContainer } from "../../Containers/Prefabs/EgalContainer";
import { EtContainer } from "../../Containers/Prefabs/EtContainer";
import { ExeFonctionContainer } from "../../Containers/Prefabs/ExeFonctionContainer";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import { FonctionContainer } from "../../Containers/Prefabs/FonctionContainer";
import { InfContainer } from "../../Containers/Prefabs/InfContainer";
import { MoinsContainer } from "../../Containers/Prefabs/MoinsContainer";
import { NotContainer } from "../../Containers/Prefabs/NotContainer";
import { OuContainer } from "../../Containers/Prefabs/OuContainer";
import { PlusContainer } from "../../Containers/Prefabs/PlusContainer";
import { PourContainer } from "../../Containers/Prefabs/PourContainer";
import { PrintContainer } from "../../Containers/Prefabs/PrintContainer";
import { SetVarContainer } from "../../Containers/Prefabs/SetVarContainer";
import { SiContainer } from "../../Containers/Prefabs/SiContainer";
import { SupContainer } from "../../Containers/Prefabs/SupContainer";
import { VarValueContainer } from "../../Containers/Prefabs/VarValueContainer";
import { Level } from "../../Environment/Level";
import { LevelReader } from "../../Environment/LevelReader";
import { ObstacleSensor } from "../../Language/Booleen/ObstacleSensor";
import { MoveBackwardInstuction } from "../../Language/Instructions/MoveBackwardInstruction";
import { MoveForwardInstuction } from "../../Language/Instructions/MoveForwardInstruction";
import { TurnLeftInstruction } from "../../Language/Instructions/TurnLeftInstruction";
import { TurnRightInstruction } from "../../Language/Instructions/TurnRightInstruction";
import { LayerMasks } from "../../Shared/Constants";
import type { ExecutionContext } from "../../Shared/types";
import { StartButton } from "../../MRGUI/StartButton";
import { MakeABlockModal } from "../../MRGUI/MakeABlockModal";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene {
    //private player: Player;
    
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
        //this.setupOutilsBox();

        new StartButton(this.leftPanel, this);
    }

    setupOutilsBox() {


        // Instructions
        this.toolbox.addTemplate("instructions", (root) => new BasicInstContainer("Avancer d'une case", new MoveForwardInstuction(this.ctx), root, this));
        this.toolbox.addTemplate("instructions", (root) => new BasicInstContainer("Reculer d'une case", new MoveBackwardInstuction(this.ctx), root, this));
        this.toolbox.addTemplate("instructions", (root) => new BasicInstContainer("Tourner à gauche", new TurnLeftInstruction(this.ctx), root, this));
        this.toolbox.addTemplate("instructions", (root) => new BasicInstContainer("Tourner à droite", new TurnRightInstruction(this.ctx), root, this));
        this.toolbox.addTemplate("instructions", (root) => new PrintContainer(root, this));
        this.toolbox.addTemplate("instructions", (root) => new SetVarContainer("x", root, this));

        // Structures
        this.toolbox.addTemplate("structures", (root) => {
            const l = new ListContainer(root, this);
            const pour = new PourContainer(l, root, this);
            l.addInstruction(pour.getQueue(), 0);
            l.addInstruction(pour.getHeader(), 0);
            l.addStruct(pour);
            return l;
        }); 
        this.toolbox.addTemplate("structures", (root) => {
            const l = new ListContainer(root, this);
            const si = new SiContainer(l, root, this);
            l.addInstruction(si.getQueue(), 0);
            l.addInstruction(si.getHeader(), 0);
            l.addStruct(si);
            return l;
        });

        // Booléens
        this.toolbox.addTemplate("booleans", (root) => new BooleenBrutContainer(true, root, this));
        this.toolbox.addTemplate("booleans", (root) => new BooleenBrutContainer(false, root, this));
        this.toolbox.addTemplate("booleans", (root) => new NotContainer(root, this));
        this.toolbox.addTemplate("booleans", (root) => new EtContainer(root, this));
        this.toolbox.addTemplate("booleans", (root) => new OuContainer(root, this));
        this.toolbox.addTemplate("booleans", (root) => new InfContainer(root, this));
        this.toolbox.addTemplate("booleans", (root) => new SupContainer(root, this));
        this.toolbox.addTemplate("booleans", (root) => new EgalContainer(root, this));

        // Capteurs
        this.toolbox.addTemplate("sensors", (root) => new BasicBooleenContainer("Il y a un obstacle", new ObstacleSensor(this.ctx), root, this));

        // Variables et opérations
        this.toolbox.addTemplate("variables", (root) => new VarValueContainer("x", root, this));
        this.toolbox.addTemplate("variables", (root) => new MoinsContainer(root, this));
        this.toolbox.addTemplate("variables", (root) => new PlusContainer(root, this));

        // Fonctions
        this.toolbox.addButton("functions", "Créer un bloc de plastique", () => {
            new MakeABlockModal(this.advancedTexture, (name: string, args: string[]) => {
                console.log(" c bien " + name);
                this.toolbox.addTemplate("functions", (root) => new FonctionContainer(name, args, root, this));
                this.toolbox.addTemplate("functions", (root) => new ExeFonctionContainer(name, args.length, root, this));
            });
        });

        // Départ
        this.toolbox.addTemplate("start", (root) => {
            return new FlagContainer(root, this);
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
        let levelReader = new LevelReader();
        await levelReader.loadLevel("level0.json");
        const map = levelReader.getStructure();
        if (map.length == 0)
            throw new Error("level map is empty");
        this.level = new Level(map, this._drh, this.scene);

        this.ctx = {robot: this.level.getRobot()};
        levelReader.setupToolbox(this.toolbox, this.ctx, this);
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