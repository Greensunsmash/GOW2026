import { Button, TextBlock } from "@babylonjs/gui";

export class BaseButton extends Button {
    public mrTextBlock: TextBlock; 

    constructor(name: string, label: string, callback: () => void, width: number = 120, height: number = 40) {
        super(name);
        this.widthInPixels = width;
        this.heightInPixels = height;
        this.color = "white";
        this.background = "#0000ff";
        this.cornerRadius = 5;
        this.mrTextBlock = new TextBlock();
        this.mrTextBlock.text = label;
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