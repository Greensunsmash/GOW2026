import { Container, Control, StackPanel, TextBlock } from "@babylonjs/gui";

export class BlockCount extends Container {
    private panel :StackPanel;
    private countText: TextBlock;

    private limit: number |  null = null;

    constructor(
        root: Container
    ) {
        super("blockcount");
        this.height = "40px";
        this.width = "100px";
        this.background = "#fff";
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.top = "-30px";

        this.panel = new StackPanel("blockcount_sp");
        //this.panel.isVertical = false;
        this.addControl(this.panel);

        this.countText = new TextBlock("blockcount_textblk", "Blocs : 0");
        this.countText.height = "30px";
        this.panel.addControl(this.countText);

        root.addControl(this);
    }

    public setBlockCount(count: number) {
        this.countText.text = this.limit ? `Blocs: ${count} / ${this.limit}`:  `Blocs : ${count}`;
    }

    public setLimit(limit: number | null) {
        this.limit = limit;
        this.setBlockCount(0);
    }
}