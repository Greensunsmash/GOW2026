import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";
import { EmptySlot } from "./EmptySlot";
import { Magnet } from "./Magnet";

export class InstructionContainer extends GUI.StackPanel {

    // Ajouter un détecteur (rectangle ?) en dessous de l'instruction container, pour détecter lorsqu'on release qqch dedans

    private next : InstructionContainer | null;
    private detector : GUI.Rectangle | null;
    private bloc : BlocContainer;
    private root : GUI.Container;

    constructor(list: string[], root: GUI.Container, scene: GameScene) {
            super();

            // Setup stack panel
            this.adaptWidthToChildren = true;
            this.adaptHeightToChildren = true;
            this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            root.addControl(this);

            // Create bloc
            this.bloc = new BlocContainer("n", list, root, scene);
            this.bloc.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.bloc.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            root.removeControl(this.bloc);
            this.addControl(this.bloc);

            new DragBehavior(this);
            this.root = root;
            this.next = null;
            this.detector = new Magnet(scene, this);
            this.addControl(this.detector);
            this.build();
        }
    
    build():void {
        this.bloc.background = "#8727F5";
        this.bloc.cornerRadius = 0;
    }

    addNext(c : InstructionContainer): void {
        if (this.detector === null) return ;
        this.next = c;
        this.root.removeControl(c);
        this.addControl(c);
        c.left = 0;
        c.top = 0;
        this.removeControl(this.detector);
        this.detector = null;
        console.log(this.next);
    }

    removeNext(): void {
        if (this.next === null) return;
        const measure = this.next._currentMeasure;
        const absLeft = measure.left;
        const absTop = measure.top;
        this.removeControl(this.next);
        this.root.addControl(this.next);
        this.next.leftInPixels = absLeft;
        this.next.topInPixels = absTop;
        this.next = null;
        this.detector = new Magnet(this.getScene(), this);
        this.addControl(this.detector);
    }

    // GETTERS
    hasNext():boolean {return (this.next !== null);}
    getNext(): InstructionContainer | null {return this.next;}
    getRoot():GUI.Container{return this.root;}
    getScene():GameScene{return this.bloc.getScene()};
}