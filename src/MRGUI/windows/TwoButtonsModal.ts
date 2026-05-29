import * as GUI from "@babylonjs/gui";
import { ModalWindow } from "./ModalWindow";
import { BaseHSpacer, BaseVSpacer } from "../misc/BaseSpacers";
import { CancelButton } from "../buttons/CancelButton";
import { OkButton } from "../buttons/OkButton";
import { Colors } from "../../Shared/Colors";

// Bte de dialogue
export class TwoButtonModal extends ModalWindow {
    constructor(
        root: GUI.AdvancedDynamicTexture, 
        title: string,
        cancelLabel: string,
        validateLabel: string,
        onValidate: () => void, // callback,
        onCancel?: () => void,
        fullBlack = false,
        disposeOnValidate = true
    ) {
        super(root, title);
        if (fullBlack) this.blocker.background = "#000000";

        // Panel horizontal des boutons
        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "40px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        buttonPanel.clipChildren = false;
        buttonPanel.clipContent = false;
        this.panel.addControl(buttonPanel);

        // Annuler
        const btnCancel = new CancelButton(() => {
            onCancel?.();
            this.blocker.dispose(); 
        }, cancelLabel);
        buttonPanel.addControl(btnCancel);

        buttonPanel.addControl(new BaseHSpacer());

        // Valider
        const btnOk = new OkButton(() => {
            onValidate();
            if (disposeOnValidate) this.blocker.dispose(); 
        }, validateLabel);
        buttonPanel.addControl(btnOk);

        buttonPanel.clipChildren = false;
        buttonPanel.clipContent = false;

        this.panel.addControl(new BaseVSpacer());
    }
}