import { AdvancedDynamicTexture, Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";
import { BaseButton, IconButton } from "../buttons/BaseButton";
import { ColorGradient } from "@babylonjs/core";
import { CDPlaybar } from "./CDPlaybar";
import { LeafNavigator } from "./LeafNavigator";

export class BottomBar extends Rectangle {
    public leafNav: LeafNavigator

    constructor(
        root: AdvancedDynamicTexture,
        onFirst: () => void,
        onPrev: () => void,
        onNext: () => void,
        onLast: () => void,
        onDryAttempt: () => void,
        onPrevLeaf: () => void,
        onNextLeaf: () => void
    ) {
        super("bottombar");
        this.height= "10%";
        this.width = "98%";
        this.color = "white";
        this.thickness = 2;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.top = "-5px";
        this.paddingLeft = "1%";
        this.paddingRight = "1%";

        /*const btn = new IconButton("play-btn-newda", "Lancer", "\ue037", () => {}, 80);
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        btn.paddingLeftInPixels = 18;
        btn.paddingTopInPixels = 5;
        btn.paddingBottomInPixels = 5;
        this.addControl(btn);*/

        const cdPlaybar = new CDPlaybar(this, onFirst, onPrev, onNext, onLast, onDryAttempt);
        this.addControl(cdPlaybar);

        this.leafNav = new LeafNavigator(this, onPrevLeaf, onNextLeaf);
        this.leafNav.paddingRightInPixels = 18;
        this.addControl(this.leafNav);

        root.addControl(this);
    }

    updateLeafIndicator(text: string) {
        this.leafNav.leafInfoText.text = text;
    }
}