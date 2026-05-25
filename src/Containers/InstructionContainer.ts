import type { Vector2 } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import type { Instruction } from "../Language/Instructions/Instruction";
import { Print } from "../Language/Instructions/Print";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import { Colors } from "../Shared/Colors";
import { ThinSSAO2BlurPostProcess } from "@babylonjs/core/PostProcesses/thinSSAO2BlurPostProcess";

// Classe de base pour représenter une instruction. Contient un blocContainer pour la représentation visuelle
export class InstructionContainer extends GUI.Rectangle {

    private readonly mainContainer : GUI.StackPanel;
    protected readonly bloc : BlocContainer;
    private readonly root : GUI.Container;
    private morceauDosC: GUI.Rectangle | null = null;

    constructor(list: string[], root: GUI.Container, content_root: GUI.Container, scene: GameScene, stroke = true) {
        super();

        // Setup main rectangle
        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.isHitTestVisible = false;
        this.thickness = 0;
        this.clipChildren = false;
        this.clipContent  = false;
        root.addControl(this);
        
        // Setup stack panel
        this.mainContainer = new GUI.StackPanel();
        this.mainContainer.adaptWidthToChildren = true;
        this.mainContainer.adaptHeightToChildren = true;
        this.mainContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.mainContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.mainContainer.isHitTestVisible = false; // Désactive les inputs sur ce control (askip)
        this.mainContainer.clipChildren = false;
        this.mainContainer.clipContent = false;

        this.addControl(this.mainContainer);

        // Create bloc
        this.bloc = new BlocContainer("n", list, root, content_root, scene);
        this.bloc.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.bloc.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        if (!stroke) this.bloc.thickness = 0;
        root.removeControl(this.bloc);
        this.mainContainer.addControl(this.bloc);

        this.root = root;
        this.build();
    }
    
    build():void {
        this.bloc.background = Colors.PtitRoseDuSoir;
        this.bloc.cornerRadius = Colors.CornerRadiusCarrePasTrop;;
    }

    // Renvoie si le point donné appartient à un BlocContainer enfant (valeur ou booleen)
    public isPointHandle(coords : Vector2): (GUI.Rectangle | null) {
        let s: GUI.Rectangle = this.bloc; // Normalement le wrapper a un seul enfant
        if (s instanceof BlocContainer) {
            let result = s.isPointHandle(coords);
            if (result && result != this.bloc) return result;
        } 
        return null;
    }

    public refreshDosC(indent: number, height: number = 50) {
        if (this.morceauDosC) {
            this.removeControl(this.morceauDosC);
            this.morceauDosC.dispose();
            this.morceauDosC = null;
        }

        if (indent === 0) return;

        this.morceauDosC = new GUI.Rectangle("morceau_dos_C");
        this.morceauDosC.background = Colors.PtitRoseDuSoir; 
        this.morceauDosC.thickness = 0;
        
        this.morceauDosC.heightInPixels = height;
        
        this.morceauDosC.widthInPixels = 0; 
        this.morceauDosC.leftInPixels = -20;

        //this.morceauDosC.leftInPixels = -30;
        this.morceauDosC.paddingLeftInPixels = -indent;

        this.morceauDosC.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.morceauDosC.zIndex = -1; 
        //this.morceauDosC.isHitTestVisible = false; 

        this.addControl(this.morceauDosC);
    }

    // Par défaut print hello world (en pratique, cette fonction sera toujours override)
    getInstruction(): Instruction {return new Print(new ValeurBrute("Hello World")); }

    public toggle():void {
        if (this.bloc.background == "#8727F5") this.bloc.background = "#cac6ceff";
        else this.bloc.background = "#8727F5";
    }
    // GETTERS
    getRoot():GUI.Container{return this.root;}
    getScene():GameScene{return this.bloc.getScene()};
    getSlots():readonly GUI.Rectangle[]{return this.bloc.getSlots();}
}