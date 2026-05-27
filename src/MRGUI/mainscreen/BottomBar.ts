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
        this.height= "70px";
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

        this.firstBtn = new BaseButton("first", "⏮   Début", () => onFirst(), 200);
        this.firstBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.firstBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.firstBtn.paddingLeftInPixels = 18;
        this.addControl(this.firstBtn);

        this.cdPlaybar = new CDPlaybar(this, onPrev, onNext, onDryAttempt, onPlayPause);
        this.addControl(this.cdPlaybar);

        this.leafNav = new LeafNavigator(this, onPrevLeaf, onNextLeaf);
        this.leafNav.paddingRightInPixels = 18;
        this.addControl(this.leafNav);

        root.addControl(this);
    }

    updateLeafIndicator(text: string) {
        this.leafNav.leafInfoText.text = text;
    }

    triggerUpdate() {
        this.cdPlaybar.triggerUpdate();

        const playing = Memory.get().isPlaying();
        const atStart = !Memory.get().getCurrentInstruction();
        const hasEnded = Memory.get().hasEnded();

        if (playing) {
            this.firstBtn.isEnabled = false;
        } else {
            if (atStart) {
                this.firstBtn.isEnabled = false;
            } else if (hasEnded) {
                this.firstBtn.isEnabled = true;
            } else {
                this.firstBtn.isEnabled = true;
            }
        }
    }
}