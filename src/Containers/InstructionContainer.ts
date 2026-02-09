import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";
import { Magnet } from "./Magnet";

export class InstructionContainer extends GUI.Rectangle {

    // Ajouter un détecteur (rectangle ?) en dessous de l'instruction container, pour détecter lorsqu'on release qqch dedans

    private mainContainer : GUI.StackPanel;
    private next : InstructionContainer | null;
    private detector : Magnet | null;
    protected bloc : BlocContainer;
    private root : GUI.Container;
    private first_only : boolean = false;

    constructor(list: string[], root: GUI.Container, scene: GameScene) {
            super();

            // Setup main rectangle
            this.adaptWidthToChildren = true;
            this.adaptHeightToChildren = true;
            this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            this.isHitTestVisible = false;
            root.addControl(this);
            

            // Setup stack panel
            this.mainContainer = new GUI.StackPanel();
            this.mainContainer.adaptWidthToChildren = true;
            this.mainContainer.adaptHeightToChildren = true;
            this.mainContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.mainContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            this.mainContainer.isHitTestVisible = false; // Désactive les inputs sur ce control (askip)

            this.addControl(this.mainContainer);

            // Create bloc
            this.bloc = new BlocContainer("n", list, root, scene);
            this.bloc.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.bloc.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            root.removeControl(this.bloc);
            this.mainContainer.addControl(this.bloc);

            new DragBehavior(this.bloc, this);
            this.root = root;
            this.next = null;
            this.detector = new Magnet(scene, this);
            this.mainContainer.addControl(this.detector);
            this.build();
        }
    
    build():void {
        this.bloc.background = "#8727F5";
        this.bloc.cornerRadius = 0;
    }

    addNext(c : InstructionContainer): void {
        if (this.detector === null) {
            console.log("detctor null");
            return;
        }
        this.next = c;
        this.root.removeControl(c);
        this.mainContainer.addControl(c);
        c.left = 0;
        c.top = 0;
        this.mainContainer.removeControl(this.detector);
        this.detector.dispose();
        this.detector = null;
    }

    removeNext(): void {
        if (this.next === null) return;
        console.log("release");
        const measure = this.next._currentMeasure;
        const absLeft = measure.left;
        const absTop = measure.top;
        this.mainContainer.removeControl(this.next);
        this.root.addControl(this.next);
        this.next.leftInPixels = absLeft;
        this.next.topInPixels = absTop;
        this.next = null;
        this.detector = new Magnet(this.getScene(), this);
        this.mainContainer.addControl(this.detector);
    }

    // Utilisé lorsqu'on grab l'objet, pour désactiver l'hovering
    unableSlotHovering():void {
        if (this.detector) this.detector.setBlock(true);
        else if (this.next) this.next.unableSlotHovering();
    }
    enableSlotHovering():void {
        if (this.detector) this.detector.setBlock(false);
        else if (this.next) this.next.enableSlotHovering();
    }

    // GETTERS
    hasNext():boolean {return (this.next !== null);}
    getNext(): InstructionContainer | null {return this.next;}
    getRoot():GUI.Container{return this.root;}
    getScene():GameScene{return this.bloc.getScene()};
    isFirstOnly():boolean{return this.first_only;}
    protected setFirstOnly(bool:boolean):void{this.first_only = bool;}
}