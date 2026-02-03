import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";

export class InstructionContainer extends GUI.StackPanel {

    // Ajouter un détecteur (rectangle ?) en dessous de l'instruction container, pour détecter lorsqu'on release qqch dedans

    private next : InstructionContainer | null;
    private bloc : BlocContainer;
    private texture : GUI.AdvancedDynamicTexture;

    constructor(list: string[], advancedTexture: GUI.AdvancedDynamicTexture, scene: GameScene) {
            super();

            // Setup stack panel
            this.adaptWidthToChildren = true;
            this.adaptHeightToChildren = true;
            this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(this);

            // Create bloc
            this.bloc = new BlocContainer("n", list, advancedTexture, scene);
            this.bloc.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.bloc.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.removeControl(this.bloc);
            this.addControl(this.bloc);

            new DragBehavior(this);
            this.texture = advancedTexture;
            this.next = null;
            this.build();
        }
    
    build():void {
        this.bloc.background = "#8727F5";
        this.bloc.cornerRadius = 0;
    }

    addNext(c : InstructionContainer): void {
        this.next = c;
        this.texture.removeControl(c);
        this.addControl(c);
    }

    removeNext(): void {
        if (this.next === null) return;
        const measure = this.next._currentMeasure;
        const absLeft = measure.left;
        const absTop = measure.top;
        this.removeControl(this.next);
        this.texture.addControl(this.next);
        this.next.leftInPixels = absLeft;
        this.next.topInPixels = absTop;
        this.next = null;
    }

    // GETTERS
    hasNext():boolean {return (this.next !== null);}
    getNext(): InstructionContainer | null {return this.next;}
    getTexture():GUI.AdvancedDynamicTexture{return this.texture;}
    getScene():GameScene{return this.bloc.getScene()};
}