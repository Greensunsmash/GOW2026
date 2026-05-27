import { Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

export class LevelCount extends Rectangle {
    private panel :StackPanel;
    private countText: TextBlock;

    private limit: number |  null = null;

    constructor(
        root: Container
    ) {
        super("levelcount");
        this.height = "60px";
        this.width = "350px";
        this.color = "#ffffffb2";
        this.thickness = 1;
        this.background = "#dfe9ffce";
        this.cornerRadius = Colors.CornerRadiusVraimentArrondi;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 12;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.top = "8%";

        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.paddingRight = "4%";

        this.panel = new StackPanel("levelcount_sp");
        //this.panel.isVertical = false;
        this.addControl(this.panel);

        this.countText = new TextBlock("levelcount_textblk", "Blocs : 0");
        this.countText.height = "30px";
        this.countText.fontFamily = "Inter";
        this.countText.fontWeight = "400";
        this.countText.color = "black";
        this.countText.fontSize = 18;
        this.panel.addControl(this.countText);
        root.addControl(this);
    }

    public setCount(count: number) {
        this.countText.text = this.limit ? `Niveaux complétés : ${count} sur ${this.limit}`:  `Niveaux complétés : ${count}`;
    }

    public setTotal(limit: number | null) {
        this.limit = limit;
        this.setCount(0);
    }
}