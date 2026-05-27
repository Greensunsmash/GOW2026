import { AdvancedDynamicTexture, Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";
import { BaseButton, IconButton } from "../buttons/BaseButton";
import { ColorGradient } from "@babylonjs/core";
import { CDPlaybar } from "./CDPlaybar";
import { LeafNavigator } from "./LeafNavigator";
import { Memory } from "../../Language/Memory";

export class BottomBar extends Rectangle {
    
    private firstBtn: BaseButton;
    public leafNav: LeafNavigator;
    public cdPlaybar: CDPlaybar;

    constructor(
        root: AdvancedDynamicTexture,
        onFirst: () => void,
        onPrev: () => void,
        onNext: () => void,
        onDryAttempt: () => void,
        onPrevLeaf: () => void,
        onNextLeaf: () => void,
        onPlayPause: () => void
    ) {
        super("bottombar");
        this.height= "50%";
        this.width="50%";
        this.color = "white";
        this.thickness = 0;
        this.background = "#00000000";
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.paddingBottom = "20px";
        this.paddingRight = "58px";

        /*const btn = new IconButton("play-btn-newda", "Lancer", "\ue037", () => {}, 80);
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        btn.paddingLeftInPixels = 18;
        btn.paddingTopInPixels = 5;
        btn.paddingBottomInPixels = 5;
        this.addControl(btn);*/

        const panel = new StackPanel();
        panel.isVertical = true;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.spacing = 15;

        this.cdPlaybar = new CDPlaybar(this, onFirst, onPrev, onNext, onDryAttempt, onPlayPause);
        this.cdPlaybar.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.cdPlaybar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.leafNav = new LeafNavigator(this, onPrevLeaf, onNextLeaf);
        this.leafNav.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.leafNav.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        //this.leafNav.paddingRightInPixels = 18;

        
        panel.addControl(this.leafNav);
        panel.addControl(this.cdPlaybar);

        this.addControl(panel);
    }

    updateLeafIndicator(text: string) {
        this.leafNav.leafInfoText.text = text;
    }

    triggerUpdate() {
        this.cdPlaybar.triggerUpdate();
    }
}