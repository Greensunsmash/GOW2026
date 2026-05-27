import { AdvancedDynamicTexture, Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";
import { BaseButton, IconButton } from "../buttons/BaseButton";
import { ColorGradient } from "@babylonjs/core";
import { BlockCount } from "./BlockCount";
import type { ItemDisplay } from "../../Entity/ItemDisplay";
import { ItemsHUD } from "./ItemsHUD";
import { ClueDrawer } from "./ClueDrawer";

export class TopBar extends Rectangle {
    public blockCount: BlockCount;
    public itemDisp: ItemsHUD;
    public clueDrw: ClueDrawer;
    public drawBtn: BaseButton;

    constructor(
        root: AdvancedDynamicTexture,
        onBackClick: () => void
    ) {
        super("topbar");
        this.height= "70px";
        this.width = "98%";
        this.color = "white";
        this.thickness = 0;
        this.background = "#00000000";
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.top = "5px";
        this.paddingLeft = "1%";
        this.paddingRight = "1%";

        const btn = new BaseButton("giveup-btn-nouvelleda", "‹   Retour base", onBackClick, 200);
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        btn.paddingLeftInPixels = 18;
        btn.height = "40px";
        this.addControl(btn);


        this.clueDrw = new ClueDrawer(root);

        const drawBtn = new BaseButton("clue-btn", "P'tit indice ?", () => this.clueDrw.toggle(), 200);
        drawBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        drawBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        drawBtn.height = "40px";
        drawBtn.isVisible = false;
        this.addControl(drawBtn);
        this.drawBtn = drawBtn;

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

    loadClues(clues: string[]) {
        if (clues.length === 0) {
            this.drawBtn.isVisible = false;
            return;
        }

        this.drawBtn.isVisible = true;
        this.clueDrw.loadClues(clues);
    }

}