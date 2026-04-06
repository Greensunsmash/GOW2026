// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, Control, StackPanel } from "@babylonjs/gui";
import { BaseButton } from "./buttons/BaseButton";
import { BaseVSpacer } from "./misc/BaseSpacers";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends StackPanel {
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
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.left = "-20px"; 
        this.top = "-20px";

        this.zIndex = 100;

        this.addControl(new BaseButton("prev", "Reculer", () => onPrev()));
        this.addControl(new BaseButton("next", "Avancer", () => onNext()));
        this.addControl(new BaseButton("fullattempt", "Vrai essai", () => onFullAttempt()));
        this.addControl(new BaseVSpacer());

        this.addControl(new BaseButton("prevleaf", "- feuille", () => onPrevLeaf()));
        this.addControl(new BaseButton("nextleaf", "+ feuille", () => onNextLeaf()));
    }
}