
import { Container, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { BaseButton } from "../buttons/BaseButton";
import { BaseHSpacer } from "../misc/BaseSpacers";

export class LeafNavigator extends Container {
    private panel: StackPanel;

    constructor(
        root: Container,
        onPrev: () => void,
        onNext: () => void
    ) {
        super("leafnav");

        //this.width = "200px";
        this.height = "40px";
        //this.adaptHeightToChildren = true;
        this.adaptWidthToChildren = true;
        //this.zIndex = 100;

        this.panel = new StackPanel();
        this.panel.isVertical = false;

        this.panel.addControl(new BaseButton("prevlf", "-", () => onPrev(), 40));
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("nextlf", "+", () => onNext(), 40));
        this.addControl(this.panel);
    }
}