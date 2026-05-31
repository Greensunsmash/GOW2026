import { Container, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import type { ItemType } from "../../Environment/LevelReader";
import { Colors } from "../../Shared/Colors";
import { Animation } from "@babylonjs/core";

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
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        //this.top = "12%";
        //this.left = "25%";
    
        this.isVisible = false;

        this.panel = new StackPanel("itemdisp_sp");
        //this.panel.isVertical = false;
        this.addControl(this.panel);

        this.itemsText = new TextBlock("itemdisp_txt", "Items : ");
        this.itemsText.height = "30px";
        this.itemsText.fontFamily = "Inter";
        this.itemsText.fontWeight = "200";
        //this.itemsText.fontSize = 14;
        this.panel.addControl(this.itemsText);
        root.addControl(this);
    }

    public setItems(itemCount: number, goalItemCount: number) {
        if (goalItemCount < 1) {
            this.isVisible = false;
            return;
        }
        this.itemsText.text = `Débris : ${itemCount} / ${goalItemCount}`;
        this.isVisible = true;
        if (itemCount >= goalItemCount) {
            this.background = Colors.Accent;
            this.itemsText.fontWeight = "400";

            this.punchScale(true);
        } else {
            this.background = Colors.AccentDuSud;
            this.itemsText.fontWeight = "300";
            
            this.punchScale(false);
        }
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