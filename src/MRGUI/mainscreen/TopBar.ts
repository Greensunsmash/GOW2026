import { AdvancedDynamicTexture, Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";
import { BaseButton, IconButton } from "../buttons/BaseButton";
import { ColorGradient } from "@babylonjs/core";
import { BlockCount } from "./BlockCount";
import type { ItemDisplay } from "../../Entity/ItemDisplay";
import { ItemsHUD } from "./ItemsHUD";

export class TopBar extends Rectangle {
    public blockCount: BlockCount;
    public itemDisp: ItemsHUD;

    constructor(
        root: AdvancedDynamicTexture,
        onBackClick: () => void
    ) {
        super("topbar");
        this.height= "10%";
        this.width = "96%";
        this.color = "white";
        this.thickness = 2;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.top = "5px";
        this.paddingLeft = "2%";
        this.paddingRight = "2%";

        const btn = new IconButton("giveup-btn-nouvelleda", "Retour base", "\ue5cb", onBackClick, 80);
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        btn.paddingLeftInPixels = 18;
        btn.paddingTopInPixels = 5;
        btn.paddingBottomInPixels = 5;
        this.addControl(btn);

        /*const title = new TextBlock("topbar-title");
        title.text = "Mission exemple";
        title.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.fontSize = 14;
        title.fontFamily = "Inter";
        title.fontWeight = "300";
        title.widthInPixels = 200;

        const titleBlockRect = new Rectangle("dialogTitleRect");
        //titleBlockRect.height = "50px";
        titleBlockRect.height = "80%";
        titleBlockRect.background = Colors.PtitRoseDuSoir;
        titleBlockRect.adaptWidthToChildren = true;
        titleBlockRect.cornerRadius = 22;
        titleBlockRect.thickness = 0;
        titleBlockRect.adaptWidthToChildren = true;
        titleBlockRect.addControl(title);
        titleBlockRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        titleBlockRect.paddingTopInPixels = 5;
        titleBlockRect.paddingBottomInPixels = 5;
        this.addControl(titleBlockRect);*/

        const rightPanel = new StackPanel("topbar-right");
        rightPanel.isVertical = false;
        rightPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        rightPanel.adaptWidthToChildren = true;
        rightPanel.paddingRightInPixels = 18;
        rightPanel.spacing = 10;

        this.blockCount = new BlockCount(this);
        this.itemDisp = new ItemsHUD(this);

        rightPanel.addControl(this.blockCount);
        rightPanel.addControl(this.itemDisp);

        
        this.addControl(rightPanel);

        root.addControl(this);
    }

}