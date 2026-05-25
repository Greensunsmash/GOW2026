import { Button, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

export class BaseButton extends Button {
    public mrTextBlock: TextBlock; 

    constructor(name: string, label: string, callback: () => void, width: number = 120, height: number = 40) {
        super(name);
        this.widthInPixels = width;
        this.heightInPixels = height;
        this.color = "white";
        this.thickness = 0;
        this.background = Colors.Accent;
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.mrTextBlock = new TextBlock();
        this.mrTextBlock.text = label;
        this.mrTextBlock.fontFamily = "Inter";
        this.mrTextBlock.color = this.color;
        this.addControl(this.mrTextBlock);
        this.onPointerUpObservable.add(() => callback());
    }
}

export class LargeButton extends BaseButton {
    constructor(name: string, label: string, callback: () => void) {
        super(name, label, callback, 300);
    }
}