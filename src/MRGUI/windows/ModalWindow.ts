import { AdvancedDynamicTexture, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";

export class ModalWindow extends Rectangle {
    public panel: StackPanel;
    public blocker: GreyBlocker;

    constructor(root: AdvancedDynamicTexture, title: string) {
        super("modalWindow");
        this.blocker = new GreyBlocker();
        this.blocker.addControl(this);

        this.width = "400px";
        //window.height = "220px";
        this.adaptHeightToChildren = true;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = Colors.AccentDuSud;

        this.panel = new StackPanel();
        this.addControl(this.panel);

        this.panel.addControl(new BaseVSpacer());

        const titleBlock = new TextBlock("dialogTitle", title);
        titleBlock.height = "50px";
        titleBlock.color = "black";
        titleBlock.fontSize = 18;
        titleBlock.fontFamily = "Inter";
        titleBlock.resizeToFit = true;

        const titleBlockRect = new Rectangle("dialogTitleRect");
        titleBlockRect.height = "50px";
        titleBlockRect.background = Colors.PtitRoseDuSoir;
        titleBlockRect.cornerRadius = 22;
        titleBlockRect.adaptWidthToChildren = true;

        titleBlockRect.addControl(titleBlock);
        this.panel.addControl(titleBlockRect);

        
        root.addControl(this.blocker);
    }
}