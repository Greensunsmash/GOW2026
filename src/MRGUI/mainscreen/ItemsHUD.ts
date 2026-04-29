import { Container, Control, StackPanel, TextBlock } from "@babylonjs/gui";
import type { ItemType } from "../../Environment/LevelReader";

export class ItemsHUD extends Container {
    private panel :StackPanel;
    private itemsText: TextBlock;

    constructor(
        root: Container
    ) {
        super("itemdisp");
        this.height = "40px";
        this.width = "100px";
        this.background = "#fff";
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.top = "30px";

        this.panel = new StackPanel("itemdisp_sp");
        //this.panel.isVertical = false;
        this.addControl(this.panel);

        this.itemsText = new TextBlock("itemdisp_txt", "Items : ");
        this.itemsText.height = "30px";
        this.panel.addControl(this.itemsText);

        root.addControl(this);
    }

    public setItems(items: ItemType[]) {
        this.itemsText.text = `Items: ${items.join(',')}`;
    }
}