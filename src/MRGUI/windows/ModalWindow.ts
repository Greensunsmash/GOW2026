import { AdvancedDynamicTexture, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";

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
        this.background = "#2b2b2b";
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = "#555555"; 

        this.panel = new StackPanel();
        this.addControl(this.panel);

        this.panel.addControl(new BaseVSpacer());

        const titleBlock = new TextBlock("dialogTitle", title);
        titleBlock.height = "50px";
        titleBlock.color = "white";
        titleBlock.fontSize = 22;
        titleBlock.fontWeight = "bold";
        this.panel.addControl(titleBlock);

        
        root.addControl(this.blocker);
    }
}