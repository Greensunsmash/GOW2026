import { Rectangle } from "@babylonjs/gui";

export class GreyBlocker extends Rectangle {
    constructor() {
        super("blocker");
        this.width = "100%";
        this.height = "100%";
        this.background = "rgba(0, 0, 0, 0.6)"; 
        this.thickness = 0;
        this.isPointerBlocker = true; 
    }
}