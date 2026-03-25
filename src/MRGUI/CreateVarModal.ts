import * as GUI from "@babylonjs/gui";

// Bte de dialogue
// "Créer une variable"
export class CreateVarModal {
    constructor(
        root: GUI.AdvancedDynamicTexture, 
        onValidate: (varName: string) => void, // callback, censé créer deux blocs dans la toolbox
        prevName?: string // en cas d'edit
    ) {
        // Voile gris derrière
        const blocker = new GUI.Rectangle("dialogBlocker");
        blocker.width = "100%";
        blocker.height = "100%";
        blocker.background = "rgba(0, 0, 0, 0.6)"; 
        blocker.thickness = 0;
        blocker.isPointerBlocker = true; 
        
        // Bte de dialogue
        const window = new GUI.Rectangle("dialogWindow");
        window.width = "400px";
        //window.height = "220px";
        window.adaptHeightToChildren = true;
        window.background = "#2b2b2b";
        window.cornerRadius = 10;
        window.thickness = 2;
        window.color = "#555555"; 
        blocker.addControl(window);

        // Panel vertical qui contiendra ts les  controles
        const panel = new GUI.StackPanel();
        window.addControl(panel);

        // Titre
        const title = new GUI.TextBlock("dialogTitle", "Créer une nouvelle variable plastique");
        title.height = "50px";
        title.color = "white";
        title.fontSize = 22;
        title.fontWeight = "bold";
        panel.addControl(title);

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
        panel.addControl(input);

        const spacer = new GUI.Rectangle();
        spacer.height = "30px";
        spacer.thickness = 0;
        panel.addControl(spacer);

        // Panel horizontal des boutons
        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "40px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.addControl(buttonPanel);

        // Annuler
        const btnCancel = GUI.Button.CreateSimpleButton("btnCancel", "Annuler");
        btnCancel.width = "120px";
        btnCancel.height = "40px";
        btnCancel.color = "white";
        btnCancel.background = "#d32f2f"; 
        btnCancel.cornerRadius = 5;
        btnCancel.onPointerUpObservable.add(() => {
            blocker.dispose(); 
        });
        buttonPanel.addControl(btnCancel);

        const btnSpacer = new GUI.Rectangle();
        btnSpacer.width = "20px";
        btnSpacer.thickness = 0;
        buttonPanel.addControl(btnSpacer);

        // Valider
        const btnOk = GUI.Button.CreateSimpleButton("btnOk", "Créer");
        btnOk.width = "120px";
        btnOk.height = "40px";
        btnOk.color = "white";
        btnOk.background = "#4caf50"; 
        btnOk.cornerRadius = 5;
        btnOk.onPointerUpObservable.add(() => {
            const name = input.text.trim();
            if (name !== "") {
                onValidate(name);
                blocker.dispose(); 
            }
        });
        buttonPanel.addControl(btnOk);

        const spacer3 = new GUI.Rectangle();
        spacer3.height = "10px";
        spacer3.thickness = 0;
        panel.addControl(spacer3);

        root.addControl(blocker);
        
        input.focus();
    }
}