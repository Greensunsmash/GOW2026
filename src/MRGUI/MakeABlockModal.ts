import * as GUI from "@babylonjs/gui";

export class MakeABlockModal {
    private args: string[] = [];
    private argsPanel: GUI.StackPanel;

    updateArgsView() {
        this.argsPanel.clearControls();

        this.args.forEach((arg: string, index: number) => {
            const hPanel = new GUI.StackPanel("hPanel" + index);
            hPanel.isVertical = false;
            hPanel.height = "50px";
            const nameField = new GUI.InputText("namefield" + index);
            nameField.height = "40px";
            nameField.width = "200px";
            nameField.background = "#200000";
            nameField.color = "#ffffff"; 
            nameField.placeholderText =  "Hole name";
            if (arg != "") nameField.text = arg;
            nameField.onTextChangedObservable.add(() => {
                this.args[index] = nameField.text;
            });

            const spacer = new GUI.Rectangle();
            spacer.width = "20px";
            spacer.thickness = 0;

            const btnRemove = GUI.Button.CreateSimpleButton("remove" + index, "X");
            btnRemove.width = "40px";
            btnRemove.height = "40px";
            btnRemove.cornerRadius = 20;
            btnRemove.color = "white";
            btnRemove.background = "#aa0000";

            btnRemove.onPointerUpObservable.add(() => {
                this.args.splice(index, 1);
                this.updateArgsView();
            });

            hPanel.addControl(nameField);
            hPanel.addControl(spacer);
            hPanel.addControl(btnRemove);

            this.argsPanel.addControl(hPanel);
            
        });

        const btnAddArg = GUI.Button.CreateSimpleButton("btnAddArg", "+ trou");
        btnAddArg.width = "120px";
        btnAddArg.height = "40px";
        btnAddArg.color = "white";
        btnAddArg.background = "#d32f2f"; 
        btnAddArg.cornerRadius = 5;
        btnAddArg.onPointerUpObservable.add(() => {
            this.args.push("");
            this.updateArgsView();
        });
        this.argsPanel.addControl(btnAddArg);
    }

    constructor(
        root: GUI.AdvancedDynamicTexture, 
        onValidate: (blockName: string, args: string[]) => void,
        prevName?: string,
        prevArgs?: string[]
    ) {
        const blocker = new GUI.Rectangle("dialogBlocker");
        blocker.width = "100%";
        blocker.height = "100%";
        blocker.background = "rgba(0, 0, 0, 0.6)"; 
        blocker.thickness = 0;
        blocker.isPointerBlocker = true; 
        
        const window = new GUI.Rectangle("dialogWindow");
        window.width = "400px";
        //window.height = "220px";
        window.adaptHeightToChildren = true;
        window.background = "#2b2b2b";
        window.cornerRadius = 10;
        window.thickness = 2;
        window.color = "#555555"; 
        blocker.addControl(window);

        const panel = new GUI.StackPanel();
        window.addControl(panel);

        const title = new GUI.TextBlock("dialogTitle", "Créer un nouveau bloc de PVC");
        title.height = "50px";
        title.color = "white";
        title.fontSize = 22;
        title.fontWeight = "bold";
        panel.addControl(title);

        const input = new GUI.InputText("dialogInput");
        input.width = "80%";
        input.height = "40px";
        input.color = "white";
        input.background = "#1e1e1e";
        input.placeholderText = "Nom de ton bloc en PVC...";
        input.placeholderColor = "gray";
        input.focusedBackground = "#2a2a2a";
        if (prevName) input.text = prevName;
        panel.addControl(input);

        const spacer = new GUI.Rectangle();
        spacer.height = "30px";
        spacer.thickness = 0;
        panel.addControl(spacer);

        this.argsPanel = new GUI.StackPanel();
        if (prevArgs) this.args = prevArgs; // en cas d'edit 
        this.updateArgsView();
        panel.addControl(this.argsPanel);

        const spacer2 = new GUI.Rectangle();
        spacer2.height = "30px";
        spacer2.thickness = 0;
        panel.addControl(spacer2);

        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "40px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.addControl(buttonPanel);

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

        const btnOk = GUI.Button.CreateSimpleButton("btnOk", "Créer");
        btnOk.width = "120px";
        btnOk.height = "40px";
        btnOk.color = "white";
        btnOk.background = "#4caf50"; 
        btnOk.cornerRadius = 5;
        btnOk.onPointerUpObservable.add(() => {
            const blockName = input.text.trim();
            if (blockName !== "") {
                const cleanArgs = this.args.filter(a => a.trim() !== "");
                onValidate(blockName, cleanArgs);
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