import { Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

export class BlockCount extends Rectangle {
    private panel :StackPanel;
    private countText: TextBlock;

    private limit: number |  null = null;

    constructor(
        root: Container
    ) {
        super("blockcount");
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
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        //this.top = "12%";

        this.panel = new StackPanel("blockcount_sp");
        //this.panel.isVertical = false;
        this.addControl(this.panel);

        this.countText = new TextBlock("blockcount_textblk", "Blocs : 0");
        this.countText.height = "30px";
        this.countText.fontFamily = "Inter";
        this.countText.fontWeight = "200";
        //this.countText.fontSize = 14;
        this.panel.addControl(this.countText);
        root.addControl(this);
    }

    public setBlockCount(count: number) {
        this.countText.text = this.limit ? `Blocs: ${count} / ${this.limit}`:  `Blocs : ${count}`;
        if (this.limit && count >= this.limit) {
            this.background = Colors.Accent;
        } else if (this.limit && count >= 0.8 * this.limit) {
            this.background = Colors.AccentDuSud;
        } else {
            this.background = Colors.HighlightStroke;;
        }
    }

    public setLimit(limit: number | null) {
        this.limit = limit;
        this.setBlockCount(0);
    }
}