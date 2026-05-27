
import { Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { BaseButton } from "../buttons/BaseButton";
import { BaseHSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";

export class LeafNavigator extends Container {
    private panel: StackPanel;
    public leafInfoText: TextBlock;

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
        //this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.clipChildren = false;
        this.clipContent = false;
        //this.zIndex = 100;

        this.panel = new StackPanel();
        this.panel.isVertical = false;
        this.panel.clipChildren = false;
        this.panel.clipContent = false;

        const leafInfoText = new TextBlock();
        leafInfoText.fontFamily = "Inter";
        //leafInfoText.fontSize = 14;
        leafInfoText.fontWeight = "200";
        leafInfoText.text = "blablatest";
        leafInfoText.color = "white";
        this.leafInfoText = leafInfoText;

        const leafInfoRect = new Rectangle();
        leafInfoRect.widthInPixels = 200;
        leafInfoRect.color = "white";
        //leafInfoRect.thickness = 1;
        leafInfoRect.background = Colors.PtitRoseDuSoir;
        leafInfoRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        /*leafInfoRect.shadowOffsetX = 1;
        leafInfoRect.shadowOffsetY = 1;
        leafInfoRect.shadowColor = "#00000040";
        leafInfoRect.shadowBlur = 6;*/
        leafInfoRect.addControl(leafInfoText);

        this.panel.addControl(new BaseButton("prevlf", "-", () => onPrev(), 40));
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(leafInfoRect);
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(new BaseButton("nextlf", "+", () => onNext(), 40));
        this.addControl(this.panel);
        
    }

}