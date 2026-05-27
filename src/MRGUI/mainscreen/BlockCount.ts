import { Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";
import { Animation } from "@babylonjs/core";

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
            this.punchScale();
            this.countText.fontWeight = "400";
        } else if (this.limit && count >= 0.8 * this.limit) {
            this.background = Colors.AccentDuSud;
            this.punchScale(false);
            this.countText.fontWeight = "300";
        } else {
            this.background = Colors.HighlightStroke;;
            this.countText.fontWeight = "200";
        }
    }

    public setLimit(limit: number | null) {
        this.limit = limit;
        this.setBlockCount(0);
    }

    private punchScale(intense: boolean = true): void {
        const anim = new Animation(
            "scalePunch",
            "scaleX", 
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0,  value: 1    },
            { frame: 4,  value: intense ? 0.96 : 0.99 },
            { frame: 8,  value: intense ? 1.04 : 1.01 },
            { frame: 12, value: 1    },
        ];
        anim.setKeys(keys);

        const animY = new Animation(
            "scalePunch",
            "scaleY", 
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        animY.setKeys(keys);

        this.animations = [anim, animY];
        this._host.getScene()!.beginAnimation(this, 0, 12, false);
    }
}