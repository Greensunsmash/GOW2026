import { Container, Control, StackPanel, TextBlock } from "@babylonjs/gui";
import { CDPlaybar } from "./CDPlaybar";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { LeafNavigator } from "./LeafNavigator";
import { BaseButton } from "../buttons/BaseButton";

export class MainNavigator extends Container {
    private panel: StackPanel;

    private leafIndicator: TextBlock;

    private onPrevStep: () => void;
    private onNextStep: () => void;
    private onFirstStep: () => void;
    private onLastStep: () => void;
    private onPrevLeaf: () => void;
    private onNextLeaf: () => void;
    private onTestButton: () => void;
    private onFullButton: () => void;

    constructor(
        root: Container,
        onFirstStep: () => void,
        onPrevStep: () => void,
        onNextStep: () => void,
        onLastStep: () => void,
        onPrevLeaf: () => void,
        onNextLeaf: () => void,
        onTestButton: () => void,
        onFullButton: () => void
    ) {
        super("mainnav");

        this.width = "240px";
        //this.height = "300px";
        this.adaptHeightToChildren = true;
        //this.adaptWidthToChildren = true;

        this.panel = new StackPanel();
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.left = "-20px";
        this.top = "-20px";

        //this.panel.zIndex = 100;

        this.onPrevStep = onPrevStep;
        this.onNextStep = onNextStep;
        this.onFirstStep = onFirstStep;
        this.onLastStep = onLastStep;
        this.onPrevLeaf = onPrevLeaf;
        this.onNextLeaf = onNextLeaf;
        this.onTestButton = onTestButton;
        this.onFullButton = onFullButton;

        this.leafIndicator = new TextBlock("leafind", "REMPLIR");
        this.leafIndicator.height = "40px";
        this.leafIndicator.color = "white";
        this.leafIndicator.fontFamily = "Inter";

        this.addControl(this.panel);
        
    }

    buildNavigator(multipleLeafMode: boolean = false) {
        this.panel.clearControls();
        if (multipleLeafMode) {
            this.panel.addControl(this.leafIndicator);
            this.panel.addControl(new BaseVSpacer(10));
            this.panel.addControl(new LeafNavigator(this, () => this.onPrevLeaf(), () => this.onNextLeaf()));
            this.panel.addControl(new BaseVSpacer());
            this.panel.addControl(new BaseButton("fullrunbtn", "Valider", () => this.onFullButton()));
            this.panel.addControl(new BaseVSpacer(30));
            this.panel.addControl(new CDPlaybar(this, () => this.onFirstStep(), () => this.onPrevStep(), () => this.onNextStep(), () => this.onLastStep(), () => this.onTestButton()));
        } else {
            this.panel.addControl(new CDPlaybar(this, () => this.onFirstStep(), () => this.onPrevStep(), () => this.onNextStep(), () => this.onLastStep(), () => this.onFullButton()));
        }
    }

    updateLeafIndicator(text: string) {
        this.leafIndicator.text = text;
    }
}