import * as GUI from "@babylonjs/gui";
import { ModalWindow } from "./ModalWindow";
import { BaseHSpacer, BaseVSpacer } from "../misc/BaseSpacers";
import { CancelButton } from "../buttons/CancelButton";
import { OkButton } from "../buttons/OkButton";

// Bte de dialogue
// "Créer une variable"
export class CreateVarModal extends ModalWindow {
    constructor(
        root: GUI.AdvancedDynamicTexture, 
        onValidate: (varName: string) => void, // callback, censé créer deux blocs dans la toolbox
        prevName?: string // en cas d'edit
    ) {
        super(root, "Créer une nouvelle variable plastique");

        // Input nom
        const input = new GUI.InputText("dialogInput");
        input.width = "80%";
        input.height = "40px";
        input.color = "white";
        input.background = "#1e1e1e";
        input.placeholderText = "Nom de ta variable...";
        input.placeholderColor = "gray";
        input.focusedBackground = "#2a2a2a";
        if (prevName) input.text = prevName;
        this.panel.addControl(input);

        this.panel.addControl(new BaseVSpacer());

        // Panel horizontal des boutons
        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "40px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.panel.addControl(buttonPanel);

        // Annuler
        const btnCancel = new CancelButton(() => {
            this.blocker.dispose(); 
        });
        buttonPanel.addControl(btnCancel);

        buttonPanel.addControl(new BaseHSpacer());

        // Valider
        const btnOk = new OkButton(() => {
            const name = input.text.trim();
            if (name !== "") {
                onValidate(name);
                this.blocker.dispose(); 
            }
        });
        buttonPanel.addControl(btnOk);

        this.panel.addControl(new BaseVSpacer());
        
        input.focus();
    }
}