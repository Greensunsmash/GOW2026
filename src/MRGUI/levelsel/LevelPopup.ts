import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";
import { BaseButton } from "../buttons/BaseButton";
import { OneButtonModal } from "../windows/OneButtonModal";
import { Animation } from "@babylonjs/core";

export class LevelPopup extends Rectangle {
    public panel: StackPanel;
    public infoPanel: StackPanel;
    public title: TextBlock;
    public btn: BaseButton;

    private currentLvlFileShown: string = "";
   // public blocker: GreyBlocker;

    constructor(root: AdvancedDynamicTexture, name: string, callback: () => void) {
        super("lvl-popup");
       /* this.blocker = new GreyBlocker();
        this.blocker.addControl(this); */

        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM; 
        this.paddingBottom = "8%";
        this.width = "500px";
        //window.height = "220px";
        this.adaptHeightToChildren = true;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = Colors.AccentDuSud;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.clipChildren = false;
        //this.isVisible = false;

        this.panel = new StackPanel();
        this.panel.clipChildren = false;
        this.panel.clipContent = false;
        this.addControl(this.panel);

        this.panel.addControl(new BaseVSpacer());

        const titleBlock = new TextBlock("lvl-popup-title", name);
        titleBlock.height = "50px";
        titleBlock.color = "white";
        titleBlock.fontSize = 18;
        titleBlock.fontWeight = "300";
        titleBlock.fontFamily = "Inter";
        titleBlock.widthInPixels = name.length*10 + 20;
        this.title = titleBlock;

        const titleBlockRect = new Rectangle("lvl-popup-title-rect");
        titleBlockRect.height = "50px";
        titleBlockRect.background = Colors.PtitRoseDuSoir;
        titleBlockRect.cornerRadius = 22;
        titleBlockRect.thickness = 0;
        titleBlockRect.adaptWidthToChildren = true;

        titleBlockRect.addControl(titleBlock);
        this.panel.addControl(titleBlockRect);

        this.panel.addControl(new BaseVSpacer());

        this.infoPanel = new StackPanel();
        this.infoPanel.clipChildren = false;
        this.infoPanel.clipContent = false;
        this.infoPanel.width = "95%";
        this.infoPanel.paddingLeft = "2.5%";
        this.infoPanel.paddingRight = "2.5%";
        this.infoPanel.spacing = 10;

        this.btn = new BaseButton("level-popup-btn", "Explorer", () => callback(), 0);
        this.infoPanel.addControl(this.btn);

        this.panel.addControl(this.infoPanel);

        this.panel.addControl(new BaseVSpacer());
        
        this.isVisible = false;
    }  

    toggle() {
        console.log("clue drawer toggled!");
        this.isVisible = !this.isVisible;
    }

    switchLevelShown(file: string, name: string) {
        if (this.currentLvlFileShown != file)
            this.isVisible = true;
        else
            this.toggle();
        this.currentLvlFileShown = file;
        this.title.text = name;
        this.title.widthInPixels = name.length*10 + 20;
        this.fadeOut(100);
        this.punchScale();
        this.fadeIn(100);
    }

    getLevelFileShown() {
        return this.currentLvlFileShown;
    }

    private fadeOut(durationMs: number): Promise<void> {
        return new Promise(resolve => {
            Animation.CreateAndStartAnimation(
                "fadeOut", this, "alpha", 60, durationMs / (1000/60),
                1, 0, Animation.ANIMATIONLOOPMODE_CONSTANT,
                undefined, resolve
            );
        });
    }
    
    private fadeIn(durationMs: number): Promise<void> {
        return new Promise(resolve => {
            Animation.CreateAndStartAnimation(
                "fadeOut", this, "alpha", 60, durationMs / (1000/60),
                0, 1, Animation.ANIMATIONLOOPMODE_CONSTANT,
                undefined, resolve
            );
        });
    }


    punchScale(): void {
        const anim = new Animation(
            "scalePunch",
            "scaleX", 
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0,  value: 1    },
            { frame: 4,  value: 0.96 },
            { frame: 8,  value: 1.04 },
            { frame: 12, value: 1    },
        ];
        anim.setKeys(keys);

        const animY = new Animation(
            "scalePunch",
            "scaleX", 
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        animY.setKeys(keys);

        this.animations = [anim, animY];
        this._host.getScene()!.beginAnimation(this, 0, 12, false);
    }
}