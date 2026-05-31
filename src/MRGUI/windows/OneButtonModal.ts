import { TextBlock, type AdvancedDynamicTexture } from "@babylonjs/gui";
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
            const t = new TextBlock("t", text);
            this.panel.addControl(t);
        }
        this.panel.addControl(btn);
        this.panel.addControl(new BaseVSpacer());
    }

    goAway() {
        this.blocker.dispose();
    }
}