import { Button, Container, Control, TextBlock } from "@babylonjs/gui";

// Bouton "Démarrer" en bas à droite
// Juste un bouton qui fait scene.run() quand on clique mdr
export class StartButton extends Button {
    private readonly root: Container;
    private readonly text: TextBlock;

    constructor(root: Container, callback: () => void) {
        super();
        this.root = root;

        this.text = new TextBlock();
        this.text.text = "Démarrer";
        this.addControl(this.text);

        this.width = "150px";
        this.height = "50px";
        this.color = "white";
        this.background = "#a0ff20"; 
        this.thickness = 2;
        this.cornerRadius = 10;
        this.fontSize = 18;
        this.fontWeight = "bold";

        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.left = "-20px"; 
        this.top = "-20px";

        this.zIndex = 100;

        this.onPointerUpObservable.add(() => {
            //console.log("Lancement du démarreur cosmique...");
            callback();
        });
    }
}