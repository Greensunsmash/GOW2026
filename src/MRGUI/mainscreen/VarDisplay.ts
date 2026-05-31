import { Animation } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { Memory } from "../../Language/Memory";
import { Colors } from "../../Shared/Colors";

export class VarDisplay extends Rectangle {
    public panel: StackPanel;
    public varPanel: StackPanel;
    private lastVars: string[] = [];
    private varTextBlocks: Map<string, TextBlock> = new Map();;

    constructor(root: AdvancedDynamicTexture) {
        super("vardisp");

        this.width = "200px";
        //window.height = "220px";
        this.adaptHeightToChildren = true;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = Colors.AccentDuSud;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000065";
        this.shadowBlur = 6;
        this.clipChildren = false;
        this.clipContent = false;
        this.isVisible = false;

        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.paddingRightInPixels = 52;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.paddingTopInPixels = 85;

        this.panel = new StackPanel();
        this.panel.clipChildren = false;
        this.panel.clipContent = false;
        this.addControl(this.panel);

        //this.panel.addControl(new BaseVSpacer(10));

        const titleBlock = new TextBlock("var-title", "Variables");
        titleBlock.height = "40px";
        titleBlock.color = "color";
        titleBlock.fontSize = 18;
        titleBlock.fontWeight = "400";
        titleBlock.fontFamily = "Inter";
        titleBlock.widthInPixels = "Variables".length*10 + 20;

        const titleBlockRect = new Rectangle("var-titlerect");
        titleBlockRect.height = "40px";
        titleBlockRect.thickness = 0;
        titleBlockRect.adaptWidthToChildren = true;

        titleBlockRect.addControl(titleBlock);
        this.panel.addControl(titleBlockRect);

        //this.panel.addControl(new BaseVSpacer(10));

        this.varPanel = new StackPanel("vars-sp");
        this.varPanel.clipChildren = false;
        this.varPanel.clipContent = true;
        this.varPanel.spacing = 10;
        
        this.varPanel.paddingBottomInPixels = 10;
        this.panel.addControl(this.varPanel);
        
        root.addControl(this);
    }

    updateFromMemory() {
        console.log("vardisp update triggered");
        const mem = Memory.get();
        const allValues = mem.getAllValues();
        console.log("received all these values : ", allValues);
        const varNames = [...allValues.keys()];
        console.log("var names ", varNames);
        const same = varNames.length === this.lastVars.length &&
                varNames.every(v => this.lastVars.includes(v));
        let willPunch = false;
        if (same) {
            for (const name of varNames) {
                const block = this.varTextBlocks.get(name);
                if (block) {
                    const strval = allValues.get(name)?.getValue()?.toString() ?? "";
                    const newval = (strval.length >= 6) ? (strval.slice(0,6) + "...") : strval;
                    if (block.text.trim() !== newval.trim()) willPunch = true;
                    block.text = `${newval}`;
                }
            }
        } else {
            willPunch = true;
            this.varPanel.clearControls();
            this.varTextBlocks.clear();
            this.lastVars = varNames;

            if (this.lastVars.length === 0) {
                this.isVisible = false;
                return;
            }

            this.isVisible = true;
            for (const name of this.lastVars) {
                const varNameBlock = new TextBlock("varnameblk-" + name);
                varNameBlock.color = "white";
                varNameBlock.fontFamily = "Inter";
                varNameBlock.fontSize = 16;
                varNameBlock.fontWeight = "400";
                varNameBlock.text = (name.length >= 6) ? name.slice(0, 6) + "..." : name;
                varNameBlock.clipContent = true;

                const varNameRect = new Rectangle("varnamerect-" + name);
                varNameRect.color = Colors.Accent;
                varNameRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
                varNameRect.thickness = 0;
                varNameRect.widthInPixels = 50;
                varNameRect.clipChildren = true;
                varNameRect.heightInPixels = 40;
                varNameRect.background = Colors.PtitRoseDuSoir;
                varNameRect.addControl(varNameBlock);

                const varValueBlock = new TextBlock("varvalueblk-" + name);
                varValueBlock.color = "black";
                varValueBlock.fontFamily = "Inter";
                varValueBlock.fontSize = 16;
                varValueBlock.fontWeight = "300";
                varValueBlock.clipContent = true;
                const strval = allValues.get(name)?.getValue()?.toString() ?? "";
                varValueBlock.text = (strval.length >= 6) ? (strval.slice(0,6) + "...") : strval;
                this.varTextBlocks.set(name, varValueBlock);

                const varValueRect = new Rectangle("varvaluerect-" + name);
                varValueRect.color = Colors.AccentDuSud;
                varValueRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
                varValueRect.thickness = 2;
                varValueRect.widthInPixels = 50;
                varValueRect.clipChildren = true;
                varValueRect.heightInPixels = 40;
                varValueRect.addControl(varValueBlock);

                const varLine = new StackPanel("varsp-" + name);
                varLine.isVertical = false;
                varLine.paddingLeftInPixels = 10;
                varLine.paddingRightInPixels = 10;
                varLine.spacing = 10;
                varLine.height = "40px";
                varLine.addControl(varNameRect);
                varLine.addControl(varValueRect);

                this.varPanel.addControl(varLine);
            }
        }
        if (willPunch) this.punchScale();
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