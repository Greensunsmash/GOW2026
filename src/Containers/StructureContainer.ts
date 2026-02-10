import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";

export class StructureContainer extends InstructionContainer {

    //private sideRectangle : GUI.Rectangle;
    //private downRectangle : GUI.Rectangle;

    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super(list, root, scene);
         
        /*
        this.sideRectangle = new GUI.Rectangle();
        this.sideRectangle.width = "10%";
        this.sideRectangle.height = "100%";
        this.sideRectangle.zIndex = -1;
        this.sideRectangle.background = "#8727F5";
        this.sideRectangle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.sideRectangle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.downRectangle = new GUI.Rectangle();
        this.downRectangle.width = "100%";
        this.downRectangle.height = "5%";
        this.downRectangle.zIndex = -1;
        this.downRectangle.background = "#8727F5";
        this.downRectangle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.downRectangle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.addControl(this.sideRectangle);
        this.addControl(this.downRectangle); */

    }
    
    addNext(c : InstructionContainer): void {
        super.addNext(c);
        c.paddingLeftInPixels = 20;
    }

    removeNext(): void {
        let c = this.getNext();
        if (c !== null) c.paddingLeftInPixels = 0;
        super.removeNext();
    }
}