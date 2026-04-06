// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, Control, Rectangle, StackPanel } from "@babylonjs/gui";
import { BaseButton } from "./buttons/BaseButton";
import { BaseVSpacer } from "./misc/BaseSpacers";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends Rectangle {
    private panel: StackPanel;

    constructor(
        root: Container,
        onPrev: () => void,
        onNext: () => void,
        onPrevLeaf: () => void,
        onNextLeaf: () => void,
        onDryAttempt: () => void,
        onFullAttempt: () => void
    ) {
        super("playbar");

        this.width = "200px";
        this.height = "300px";
        //this.adaptHeightToChildren = true;
        //this.adaptWidthToChildren = true;

        this.panel = new StackPanel();
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.panel.left = "-20px"; 
        this.panel.top = "-20px";

        //this.panel.zIndex = 100;

        this.panel.addControl(new BaseButton("prev", "Reculer", () => onPrev()));
        this.panel.addControl(new BaseButton("next", "Avancer", () => onNext()));
        this.panel.addControl(new BaseButton("fullattempt", "Vrai essai", () => onFullAttempt()));
        this.panel.addControl(new BaseVSpacer());

        this.panel.addControl(new BaseButton("prevleaf", "- feuille", () => onPrevLeaf()));
        this.panel.addControl(new BaseButton("nextleaf", "+ feuille", () => onNextLeaf()));
        this.panel.addControl(new BaseButton("dryattempt", "Faux essai", () => onDryAttempt()));

        this.addControl(this.panel);
    }
}