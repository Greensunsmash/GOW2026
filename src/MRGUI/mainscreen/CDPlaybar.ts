// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, StackPanel } from "@babylonjs/gui";
import { BaseButton } from "../buttons/BaseButton";
import { BaseHSpacer } from "../misc/BaseSpacers";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends Container {
    private panel: StackPanel;
    private multipleLeafMode = false;

    constructor(
        root: Container,
        onFirst: () => void,
        onPrev: () => void,
        onNext: () => void,
        onLast: () => void,
        onDryAttempt: () => void
    ) {
        super("cdplaybar");

        //this.width = "200px";
        this.height = "40px";
        //this.adaptHeightToChildren = true;
        this.adaptWidthToChildren = true;
        this.clipChildren = false;
        this.clipContent = false;
        //this.zIndex = 100;

        this.panel = new StackPanel();
        this.panel.isVertical = false;
        this.panel.clipChildren = false;
        this.panel.clipContent = false;

        //this.panel.addControl(new BaseButton("1st", "⏮", () => onFirst(), 30));
        //this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("prev", "⏪︎   Action d'avant", () => onPrev(), 200));
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("fullattempt", "▶   Lancer", () => onDryAttempt(), 0));
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("next", "Action d'après   ⏩︎", () => onNext(), 200));
        //this.panel.addControl(new BaseHSpacer());
        //this.panel.addControl(new BaseButton("last", "⏭", () => onLast(), 30));
        this.addControl(this.panel);
    }

    public switchMode(multipleLeaf: boolean) {
        
    }
}