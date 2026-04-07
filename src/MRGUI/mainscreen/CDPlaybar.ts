// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, Control, Rectangle, StackPanel } from "@babylonjs/gui";
import { BaseButton } from "../buttons/BaseButton";
import { BaseHSpacer, BaseVSpacer } from "../misc/BaseSpacers";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends Container {
    private panel: StackPanel;

    constructor(
        root: Container,
        onPrev: () => void,
        onNext: () => void,
        onDryAttempt: () => void
    ) {
        super("cdplaybar");

        //this.width = "200px";
        this.height = "40px";
        //this.adaptHeightToChildren = true;
        this.adaptWidthToChildren = true;
        //this.zIndex = 100;

        this.panel = new StackPanel();
        this.panel.isVertical = false;

        this.panel.addControl(new BaseButton("prev", "⏪︎", () => onPrev(), 20));
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("fullattempt", "▶", () => onDryAttempt(), 20));
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("next", "⏩︎", () => onNext(), 20));

        this.addControl(this.panel);
    }
}