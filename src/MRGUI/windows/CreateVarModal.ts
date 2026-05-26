import * as GUI from "@babylonjs/gui";
import { ModalWindow } from "./ModalWindow";
import { BaseHSpacer, BaseVSpacer } from "../misc/BaseSpacers";
import { CancelButton } from "../buttons/CancelButton";
import { OkButton } from "../buttons/OkButton";
import { Colors } from "../../Shared/Colors";

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
        input.width = "100%";
        input.height = "100%";
        input.color = "white";
        input.background = Colors.AccentDuSud
        input.placeholderText = "Nom de ta variable...";
        input.placeholderColor = "white";
        input.focusedBackground = Colors.Accent;
        input.fontFamily = "Inter";
        input.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        if (prevName) input.text = prevName;


        const inputRect = new GUI.Rectangle("dialogIn-rect");
        inputRect.width = "80%";
        inputRect.height = "50px";
        inputRect.thickness = 1;
        inputRect.color = Colors.Accent;
        inputRect.addControl(input);
        inputRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.panel.addControl(inputRect);

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

        buttonPanel.clipChildren = false;
        buttonPanel.clipContent = false;

        this.panel.addControl(new BaseVSpacer());
        
        input.focus();
    }
}