import { Rectangle } from "@babylonjs/gui";

export class BaseVSpacer extends Rectangle {
    constructor(height: number = 20) {
        super();
        this.heightInPixels = height;
        this.thickness = 0;
    }
}

export class BaseHSpacer extends Rectangle {
    constructor(width: number = 20) {
        super();
        this.widthInPixels = width;
        this.thickness = 0;
    }
}