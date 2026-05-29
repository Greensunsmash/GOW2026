import { Button, Control, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

export abstract class RealBaseButton extends Button {
    constructor(name: string, label: string, callback: () => void, width: number = 120, height: number = 40, useSecretAlgorithm = false) {
        super(name);
        this.widthInPixels = width === 0 ? (15*label.length + 20) : width;
        this.heightInPixels = height;
        this.color = "white";
        this.thickness = 1;
        this.background = Colors.Accent;
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.onPointerClickObservable.add(() => callback());
    }

    setCallback(call: () => void) {
        this.onPointerClickObservable.clear();
        this.onPointerClickObservable.add(() => call());
    }
}

export class BaseButton extends RealBaseButton {
    public mrTextBlock: TextBlock; 

    constructor(name: string, label: string, callback: () => void, width: number = 120, height: number = 40, bgColor?: string, outlineColor?: string) {
        super(name, label, callback, width, height);
        if (bgColor) this.background = bgColor;
        if (outlineColor) this.color = outlineColor;
        this.mrTextBlock = new TextBlock();
        this.mrTextBlock.text = label;
        this.mrTextBlock.fontFamily = "Inter";
        this.mrTextBlock.fontWeight = "300";
        this.mrTextBlock.color = "white";
        this.addControl(this.mrTextBlock);
    }

    setText(text: string) {
        this.mrTextBlock.text = text;
    }
    
}

export class IconButton extends RealBaseButton {
    public textBlk?: TextBlock;
    public icon: TextBlock;
    public sp: StackPanel;

    constructor(name: string, label: string, icon: string, callback: () => void, width: number = 120, height: number = 40, useSecretAlgorithm = false) {

        super(name, label, callback, width, height, useSecretAlgorithm);
        this.sp = new StackPanel(name + "-btn-sp");
        this.sp.spacing = 5;
        this.sp.paddingLeft = "15px";
        this.sp.paddingRight = "15px";
        this.sp.isVertical = false;

        if (label !== "") {
            this.textBlk = new TextBlock(name + "-btn-labelblk");
            this.textBlk.text = label;
            this.textBlk.resizeToFit = true;
            this.textBlk.fontFamily = "Inter";
            this.textBlk.fontWeight = "300";
            this.textBlk.color = "white";
        }

        this.icon = new TextBlock(name + "-btn-iconblk");
        this.icon.text = icon;
        this.icon.width = "20px";
        this.icon.fontFamily = "Material Symbols Outlined";
        this.icon.fontWeight = "200";
        this.icon.fontSize = 24;
        this.icon.color = "white";
        this.icon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.icon.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.icon.paddingTop = "7.5%";
        //this.icon.height = "10px";

        this.sp.addControl(this.icon);
        if (this.textBlk) this.sp.addControl(this.textBlk);
        this.addControl(this.sp);

        this.widthInPixels = width = width === 0 ? (10*label.length) : width;
    }
}

export class LargeButton extends BaseButton {
    constructor(name: string, label: string, callback: () => void) {
        super(name, label, callback, 300);
    }
}