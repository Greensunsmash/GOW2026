import { Button, Container, Control, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

// Bouton "Quitter" en haut à gauche
export class QuitButton extends Button {
    private readonly root: Container;
    private readonly text: TextBlock;

    constructor(root: Container, callback: () => void) {
        super();
        this.root = root;

        this.text = new TextBlock();
        this.text.text = "Abandonner";
        this.addControl(this.text);

        this.width = "150px";
        this.height = "50px";
        this.color = "white";
        this.background = Colors.Accent;
        this.thickness = 2;
        this.cornerRadius = 10;
        this.fontSize = 18;
        this.fontFamily = "Inter";

        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this.left = "-20px"; 
        this.top = "20px";

        this.zIndex = 100;

        this.onPointerUpObservable.add(() => {
            //console.log("abandon :(..");
            callback();
        });

    }
}