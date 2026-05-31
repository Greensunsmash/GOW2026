import { Rectangle, TextBlock, type AdvancedDynamicTexture } from "@babylonjs/gui";
import { ModalWindow } from "./ModalWindow";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { BaseButton } from "../buttons/BaseButton";

export class OneButtonModal extends ModalWindow {
    constructor(
        root: AdvancedDynamicTexture, 
        title: string,
        buttonText: string,
        onClose: () => void, // Callback quand on appuie
        text?: string,
        disposeOnValidate = true
    ) {
        super(root, title);
        //this.panel.addControl(new BaseVSpacer());
        const btn = new BaseButton(buttonText.trim(), buttonText, () => {
            if (disposeOnValidate) this.blocker.dispose();
            if (!disposeOnValidate) btn.isEnabled = false;
            onClose();
        }, 0 /* auto */);
        if (text) {
            const textBlockRect = new Rectangle("dialogTextRect");
            textBlockRect.adaptHeightToChildren = true;
            textBlockRect.width = "100%";
            textBlockRect.thickness = 0;
            textBlockRect.background = "#00000000";
    
            const textBlock = new TextBlock("dialogText");
            textBlock.resizeToFit = true;
            textBlock.textWrapping = true;
            textBlock.color = "black";
            textBlock.fontSize = 20;
            textBlock.fontWeight = "300";
            textBlock.fontFamily = "Inter";
            textBlock.text = text;
            textBlockRect.addControl(textBlock);
            this.panel.addControl(textBlockRect);
            textBlockRect.paddingBottomInPixels = 5;
        }
        this.panel.addControl(btn);
        this.panel.addControl(new BaseVSpacer());
    }

    goAway() {
        this.blocker.dispose();
    }
}