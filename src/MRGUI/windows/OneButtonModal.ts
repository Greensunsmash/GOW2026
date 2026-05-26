import type { AdvancedDynamicTexture } from "@babylonjs/gui";
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
    ) {
        super(root, title);
        //this.panel.addControl(new BaseVSpacer());
        this.panel.addControl(new BaseButton(buttonText.trim(), buttonText, () => {
            this.blocker.dispose();
            onClose();
        }, 0 /* auto */));
        this.panel.addControl(new BaseVSpacer());
    }
}