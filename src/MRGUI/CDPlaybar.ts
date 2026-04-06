// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, Control, StackPanel, type AdvancedDynamicTexture } from "@babylonjs/gui";
import { BaseButton } from "./buttons/BaseButton";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends StackPanel {
    constructor(
        root: Container,
        onPrev: () => void,
        onNext: () => void,
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
        this.addControl(new BaseButton("dryattempt", "Test 1 feuille", () => onDryAttempt()));
        this.addControl(new BaseButton("fullattempt", "Vrai essai", () => onFullAttempt()));
    }
}