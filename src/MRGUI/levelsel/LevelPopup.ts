import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseHSpacer, BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";
import { BaseButton } from "../buttons/BaseButton";
import { OneButtonModal } from "../windows/OneButtonModal";
import { Animation, BackEase } from "@babylonjs/core";
import { Save } from "../../Shared/Save";

export class LevelPopup extends Rectangle {
    public panel: StackPanel;
    public infoPanel: StackPanel;
    public title: TextBlock;
    public btn: BaseButton;
    public skipBtn: BaseButton;
    public textBlock: TextBlock;
    public textBlockRect: Rectangle;
    public btnSpacer: BaseHSpacer;

    private currentLvlFileShown: string = "";
   // public blocker: GreyBlocker;

    constructor(root: AdvancedDynamicTexture, name: string, onPlay: () => void, onSkip: () => void) {
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

        const btnPanel = new StackPanel();
        btnPanel.isVertical = false;

        const textBlockRect = new Rectangle("dialogTextRect");
        textBlockRect.adaptHeightToChildren = true;
        textBlockRect.width = "100%";
        textBlockRect.thickness = 0;
        textBlockRect.background = "#00000000";
        this.textBlockRect = textBlockRect;

        this.textBlock = new TextBlock("dialogText");
        this.textBlock.resizeToFit = true;
        this.textBlock.textWrapping = true;
        this.textBlock.color = "black";
        this.textBlock.fontSize = 20;
        this.textBlock.fontWeight = "300";
        this.textBlock.fontFamily = "Inter";
        this.textBlock.text = "Tu as déjà exploré cet archipel.";
        textBlockRect.addControl(this.textBlock);
        this.textBlockRect.isVisible = false;
        this.infoPanel.addControl(textBlockRect);
        textBlockRect.paddingBottomInPixels = 5;

        this.btn = new BaseButton("level-popup-btn",  "Explorer", () => onPlay(), 0);
        btnPanel.addControl(this.btn);

        this.btnSpacer = new BaseHSpacer(15);
        btnPanel.addControl(this.btnSpacer);

        this.skipBtn = new BaseButton("level-pass-btn", "Passer", () => onSkip(), 0);
        btnPanel.addControl(this.skipBtn);

        btnPanel.adaptHeightToChildren = true;
        btnPanel.adaptWidthToChildren = true;
        btnPanel.clipChildren = false;
        btnPanel.clipContent = false;

        this.infoPanel.addControl(btnPanel);

        this.panel.addControl(this.infoPanel);

        this.panel.addControl(new BaseVSpacer());
        
        this.isVisible = false;
    }  

    toggle() {
        console.log("clue drawer toggled!");
        this.isVisible = !this.isVisible;
    }

    async switchLevelShown(file: string, name: string) {
        if (this.currentLvlFileShown != file)
            this.isVisible = true;
        else
            this.toggle();
        this.currentLvlFileShown = file;
        this.title.text = name;
        this.title.widthInPixels = name.length*10 + 20;
        if (Save.isCompleted(file)) {
            this.textBlockRect.isVisible = true;
            this.btn.mrTextBlock.text = "Rééxplorer";
            this.skipBtn.isVisible = false;
            this.btnSpacer.isVisible = false;
        } else {
            this.textBlockRect.isVisible = false;
            this.btn.mrTextBlock.text = "Explorer";
            this.skipBtn.isVisible = true;
            this.btnSpacer.isVisible = true;
        }
        this.punchScale();
    }

    getLevelFileShown() {
        return this.currentLvlFileShown;
    }

    update() {
        if (!this.textBlockRect.isVisible && Save.isCompleted(this.currentLvlFileShown)) {
            this.textBlockRect.isVisible = true;
            this.btn.mrTextBlock.text = "Rééxplorer";
            this.skipBtn.isVisible = false;
            this.punchScale();
        } 
    }

    private async fadeOut(durationMs: number): Promise<void> {
        return new Promise(resolve => {
            Animation.CreateAndStartAnimation(
                "fadeOut", this, "alpha", 60, durationMs / (1000/60),
                1, 0, Animation.ANIMATIONLOOPMODE_CONSTANT,
                undefined, resolve
            );
        });
    }
    
    private async fadeIn(durationMs: number): Promise<void> {
        return new Promise(resolve => {
            Animation.CreateAndStartAnimation(
                "fadeOut", this, "alpha", 60, durationMs / (1000/60),
                0, 1, Animation.ANIMATIONLOOPMODE_CONSTANT,
                undefined, resolve
            );
        });
    }


    private punchScale(): void {
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