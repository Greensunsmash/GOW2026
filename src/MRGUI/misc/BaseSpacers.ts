import { Rectangle } from "@babylonjs/gui";

export class BaseVSpacer extends Rectangle {
    constructor(height: number = 20) {
        super("spacerV");
        this.heightInPixels = height;
        this.thickness = 0;
    }
}

export class BaseHSpacer extends Rectangle {
    constructor(width: number = 20) {
        super("spacerH");
        this.widthInPixels = width;
        this.thickness = 0;
    }
}