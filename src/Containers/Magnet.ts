import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { ListContainer } from "./ListContainer";
import { Colors } from "../Shared/Colors";

// C'est plus un magnet, juste le slot grisé qui s'affiche pour symboliser ou va se placer le bloc qu'on tient
export class Magnet extends GUI.Rectangle {

    private readonly scene:GameScene;
    private readonly blocParent : ListContainer;

    constructor(scene:GameScene, parent:ListContainer){
        super();
        this.width = "100%";
        // hauteur scotch + hauteur bloc 
        this.height = "70px";
        this.isHitTestVisible = false; // Désactive les inputs sur ce control (askip) (non)
        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.alpha = 0.3;
        this.thickness = 2;
        this.color = Colors.AccentDuSud;
        this.background = "#d87062ff";
        this.cornerRadius = Colors.CornerRadiusCarrePasTrop;
        this.isVisible = false;

        this.scene = scene;
        this.blocParent = parent;

    }
}
