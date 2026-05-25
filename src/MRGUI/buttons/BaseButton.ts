import { Button, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

export class BaseButton extends Button {
    public mrTextBlock: TextBlock; 

    constructor(name: string, label: string, callback: () => void, width: number = 120, height: number = 40) {
        super(name);
        this.widthInPixels = width;
        this.heightInPixels = height;
        this.color = "white";
        this.thickness = 1;
        this.background = Colors.Accent;
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.mrTextBlock = new TextBlock();
        this.mrTextBlock.text = label;
        this.mrTextBlock.fontFamily = "Inter";
        this.mrTextBlock.fontWeight = "300";
        this.mrTextBlock.color = "white";
        this.addControl(this.mrTextBlock);
        this.onPointerUpObservable.add(() => callback());
    }
}

export class LargeButton extends BaseButton {
    constructor(name: string, label: string, callback: () => void) {
        super(name, label, callback, 300);
    }
}