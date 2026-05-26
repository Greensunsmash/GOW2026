import { Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import type { ItemType } from "../../Environment/LevelReader";
import { Colors } from "../../Shared/Colors";

export class ItemsHUD extends Rectangle {
    private panel :StackPanel;
    private itemsText: TextBlock;

    constructor(
        root: Container
    ) {
        super("itemdisp");
        this.height = "40px";
        this.width = "140px";
        this.color = "white";
        this.thickness = 1;
        this.background = Colors.AccentDuSud;
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.top = "12%";
        this.left = "25%";
    
        this.isVisible = false;

        this.panel = new StackPanel("itemdisp_sp");
        //this.panel.isVertical = false;
        this.addControl(this.panel);

        this.itemsText = new TextBlock("itemdisp_txt", "Items : ");
        this.itemsText.height = "30px";
        this.itemsText.fontFamily = "Inter";
        this.itemsText.fontWeight = "200";
        this.itemsText.fontSize = 14;
        this.panel.addControl(this.itemsText);
        root.addControl(this);
    }

    public setItems(itemCount: number, goalItemCount: number) {
        if (goalItemCount < 1) {
            /*this.isVisible = false;
            return;*/
        }
        this.itemsText.text = `Débris : ${itemCount} / ${goalItemCount}`;
        this.isVisible = true;
        if (itemCount >= goalItemCount) {
            this.background = Colors.Accent;
        } else {
            this.background = Colors.AccentDuSud;
        }
    }
}