import { Button, TextBlock } from "@babylonjs/gui";

export class BaseButton extends Button {
    public mrTextBlock: TextBlock; 

    constructor(name: string, label: string, callback: () => void) {
        super(name);
        this.width = "120px";
        this.height = "40px";
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
        super(name, label, callback);
        this.width = "300px";
    }
}