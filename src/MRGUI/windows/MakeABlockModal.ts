import * as GUI from "@babylonjs/gui";
import { ModalWindow } from "./ModalWindow";
import { BaseHSpacer, BaseVSpacer } from "../misc/BaseSpacers";
import { CancelButton } from "../buttons/CancelButton";
import { OkButton } from "../buttons/OkButton";
import { BaseButton } from "../buttons/BaseButton";


// Boite de dialogue
// "Créer un bloc"
export class MakeABlockModal extends ModalWindow {
    private args: string[] = [];
    private argsPanel: GUI.StackPanel;

    constructor(
        root: GUI.AdvancedDynamicTexture, 
        onValidate: (blockName: string, args: string[]) => void, // Callback quand on valide
        prevName?: string, // en cas d'édition
        prevArgs?: string[] // pareil
    ) {
        super(root, "Créer un nouveau bloc");

        // Input nom du bloc
        const input = new GUI.InputText("dialogInput");
        input.width = "80%";
        input.height = "40px";
        input.color = "white";
        input.background = "#1e1e1e";
        input.placeholderText = "Nom de ton bloc en PVC...";
        input.placeholderColor = "gray";
        input.focusedBackground = "#2a2a2a";
        if (prevName) input.text = prevName;
        this.panel.addControl(input);

        // Spacer
        this.panel.addControl(new BaseVSpacer());

        // Panel des arguments
        // Géré par la fonction updateArgsView(),
        // qui affiche les arguments dans this.args[]
        this.argsPanel = new GUI.StackPanel();
        if (prevArgs) this.args = prevArgs; // en cas d'edit 
        this.updateArgsView();
        this.panel.addControl(this.argsPanel);

        // Encore un spacer
        this.panel.addControl(new BaseVSpacer());

        // Panel des 2 boutons du bas
        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "40px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.panel.addControl(buttonPanel);

        //// Btn annuler
        const btnCancel = new CancelButton(() => {
            this.blocker.dispose(); 
        });
        buttonPanel.addControl(btnCancel);

        ///// Spacer
        buttonPanel.addControl(new BaseHSpacer());

        ///// Bouton OK
        const btnOk =new OkButton(() => {
            const blockName = input.text.trim();
            if (blockName !== "") {
                // pour être SURE de pas avoir d'arguments vides
                const cleanArgs = this.args.filter(a => a.trim() !== "");
                onValidate(blockName, cleanArgs);
                this.blocker.dispose(); 
            }
        });
        buttonPanel.addControl(btnOk);

        this.panel.addControl(new BaseVSpacer());
        
        input.focus();
    }

    // Rebuild le panel de liste des arguments
    // en fonction du nom des arguments qu'on stocke dans this.args
    updateArgsView() {
        this.argsPanel.clearControls();

        this.args.forEach((arg: string, index: number) => {
            // Le panel qui contiendra
            // l'input du nom de l'arg + un bouton "supprimer"
            const hPanel = new GUI.StackPanel("hPanel" + index);
            hPanel.isVertical = false;
            hPanel.height = "50px";

            // Input "nom de l'argument"
            const nameField = new GUI.InputText("namefield" + index);
            nameField.height = "40px";
            nameField.width = "200px";
            nameField.background = "#200000";
            nameField.color = "#ffffff"; 
            nameField.placeholderText =  "Hole name";
            if (arg != "") nameField.text = arg;
            // Change le contenu de this.args quand on modifie le nom
            nameField.onTextChangedObservable.add(() => {
                this.args[index] = nameField.text;
            });

            // spacer
            const spacer = new GUI.Rectangle();
            spacer.width = "20px";
            spacer.thickness = 0;

            // Bouton supprimer
            const btnRemove = GUI.Button.CreateSimpleButton("remove" + index, "X");
            btnRemove.width = "40px";
            btnRemove.height = "40px";
            btnRemove.cornerRadius = 20;
            btnRemove.color = "white";
            btnRemove.background = "#aa0000";

            /// Callback du btn supprimer
            btnRemove.onPointerUpObservable.add(() => {
                this.args.splice(index, 1); // On enleve l'argument correspondant de this.args
                this.updateArgsView(); // On rebuild
            });

            hPanel.addControl(nameField);
            hPanel.addControl(spacer);
            hPanel.addControl(btnRemove);

            this.argsPanel.addControl(hPanel);
            
        });

        // Btn ajouter
        const btnAddArg = new BaseButton("btnAddArg", "+ trou", () => {
            this.args.push(""); 
            // Comme il y a un nouvel élément dans this.args,
            // updateArgsView() créera une nouvelle ligner
            this.updateArgsView();
        });
        btnAddArg.background = "#d32f2f"; 
        this.argsPanel.addControl(btnAddArg);
    }

    
}