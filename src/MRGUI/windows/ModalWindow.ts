import { Rectangle } from "@babylonjs/gui";

export class ModalWindow extends Rectangle {
    constructor() {
        super("modalWindow");
        this.width = "400px";
        //window.height = "220px";
        this.adaptHeightToChildren = true;
        this.background = "#2b2b2b";
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = "#555555"; 
    }
}