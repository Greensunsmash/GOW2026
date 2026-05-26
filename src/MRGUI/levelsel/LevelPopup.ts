import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";
import { BaseButton } from "../buttons/BaseButton";
import { OneButtonModal } from "../windows/OneButtonModal";

export class LevelPopup extends Rectangle {
    public panel: StackPanel;
    public infoPanel: StackPanel;
    public title: TextBlock;
    public btn: BaseButton;
   // public blocker: GreyBlocker;

    constructor(root: AdvancedDynamicTexture, name: string, callback: () => void) {
        super("lvl-popup");
       /* this.blocker = new GreyBlocker();
        this.blocker.addControl(this); */

        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP; 
        this.top = "8%";
        this.width = "500px";
        //window.height = "220px";
        this.adaptHeightToChildren = true;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = Colors.AccentDuSud;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.clipChildren = false;
        //this.isVisible = false;

        this.panel = new StackPanel();
        this.panel.clipChildren = false;
        this.panel.clipContent = false;
        this.addControl(this.panel);

        this.panel.addControl(new BaseVSpacer());

        const titleBlock = new TextBlock("lvl-popup-title", name);
        titleBlock.height = "50px";
        titleBlock.color = "white";
        titleBlock.fontSize = 18;
        titleBlock.fontWeight = "300";
        titleBlock.fontFamily = "Inter";
        titleBlock.widthInPixels = name.length*10 + 20;
        this.title = titleBlock;

        const titleBlockRect = new Rectangle("lvl-popup-title-rect");
        titleBlockRect.height = "50px";
        titleBlockRect.background = Colors.PtitRoseDuSoir;
        titleBlockRect.cornerRadius = 22;
        titleBlockRect.thickness = 0;
        titleBlockRect.adaptWidthToChildren = true;

        titleBlockRect.addControl(titleBlock);
        this.panel.addControl(titleBlockRect);

        this.panel.addControl(new BaseVSpacer());

        this.infoPanel = new StackPanel();
        this.infoPanel.clipChildren = false;
        this.infoPanel.clipContent = false;
        this.infoPanel.width = "95%";
        this.infoPanel.paddingLeft = "2.5%";
        this.infoPanel.paddingRight = "2.5%";
        this.infoPanel.spacing = 10;

        this.btn = new BaseButton("level-popup-btn", "Explorer", () => callback(), 0);
        this.infoPanel.addControl(this.btn);

        this.panel.addControl(this.infoPanel);

        this.panel.addControl(new BaseVSpacer());
        

    }

    toggle() {
        console.log("clue drawer toggled!");
        this.isVisible = !this.isVisible;
    }
}