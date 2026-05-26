import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";
import { BaseButton } from "../buttons/BaseButton";
import { OneButtonModal } from "../windows/OneButtonModal";

export class ClueDrawer extends Rectangle {
    public panel: StackPanel;
    public cluesPanel: StackPanel;
    public btn: BaseButton;
    public clues: string[] = [];
    public lastClueIndex: number = -1;
   // public blocker: GreyBlocker;

    constructor(root: AdvancedDynamicTexture) {
        super("clue-drw");
       /* this.blocker = new GreyBlocker();
        this.blocker.addControl(this); */

        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP; 
        this.top = "8%";
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
        this.isVisible = false;

        this.panel = new StackPanel();
        this.panel.clipChildren = false;
        this.panel.clipContent = false;
        this.addControl(this.panel);

        this.panel.addControl(new BaseVSpacer(40));

        const titleBlock = new TextBlock("clue-drw-title", "Indices");
        titleBlock.height = "50px";
        titleBlock.color = "white";
        titleBlock.fontSize = 18;
        titleBlock.fontWeight = "300";
        titleBlock.fontFamily = "Inter";
        titleBlock.widthInPixels = "Indices".length*10 + 20;

        const titleBlockRect = new Rectangle("clue-drw-title-rect");
        titleBlockRect.height = "50px";
        titleBlockRect.background = Colors.PtitRoseDuSoir;
        titleBlockRect.cornerRadius = 22;
        titleBlockRect.thickness = 0;
        titleBlockRect.adaptWidthToChildren = true;

        titleBlockRect.addControl(titleBlock);
        this.panel.addControl(titleBlockRect);

        this.panel.addControl(new BaseVSpacer());

        this.cluesPanel = new StackPanel();
        this.cluesPanel.clipChildren = false;
        this.cluesPanel.clipContent = false;
        this.cluesPanel.width = "95%";
        this.cluesPanel.paddingLeft = "2.5%";
        this.cluesPanel.paddingRight = "2.5%";
        this.cluesPanel.spacing = 10;

        this.btn = new BaseButton("clue-drw-show-btn", "J'en veux bien un", () => this.nextClue(), 0);
        //this.cluesPanel.addControl(this.btn);

        this.panel.addControl(this.cluesPanel);

        this.panel.addControl(new BaseVSpacer());
        
        root.addControl(this);

        this.loadClues(["blablablabla bip boup, allez vous faire boup ! lorem ipsum dolor sit helmet gifjigjdkgjfkgjfdl", "kgfjgkfdjgklfjklgdjfklgjfdjgkfjkkkkkkkkkkkkkkkkkkkkkkAHHHHHHHHHHHHHHHHHHHHHHH", "bifurquez bien par la droite CONNAAAAAAAAAAAAAAAAARD", "ENCULEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"]);
    }

    toggle() {
        console.log("clue drawer toggled!");
        this.isVisible = !this.isVisible;
    }

    loadClues(clues: string[]) {
        this.clues = clues;
        this.lastClueIndex = -1;

        if (this.clues.length >= 1) {
            this.cluesPanel.addControl(this.btn);
        }
    }

    addClue(clue: string) {
        const rect = new Rectangle("clue-rect");
        rect.background = Colors.Workbench;
        rect.thickness = 2;
        rect.color = Colors.SecondaryEnseignement;
        rect.cornerRadius = Colors.CornerRadiusCarrePasTrop;
        rect.clipContent = false;
        rect.adaptHeightToChildren = true;
        rect.width = "100%";
        //rect.clipChildren = false;

        const textBlk = new TextBlock("clue-textblk");
        textBlk.text = clue;
        textBlk.fontFamily = "Inter";
        textBlk.fontSize = 16;
        textBlk.fontWeight = "300";
        textBlk.width = "100%";
        textBlk.resizeToFit = true;
        textBlk.paddingTop = "10px";
        textBlk.paddingBottom = "10px";
        textBlk.paddingLeft = "5%";
        textBlk.paddingRight = "5%";
        textBlk.textWrapping = true;
        textBlk.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlk.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        rect.addControl(textBlk);
        this.cluesPanel.addControl(rect);
    }

    nextClue() {
        this.cluesPanel.removeControl(this.btn);

        if (this.lastClueIndex + 1 >= this.clues.length) {
            console.warn("le bouton devrait disparaitre !");
            return;
        }

        this.lastClueIndex++;
        this.addClue(this.clues[this.lastClueIndex]);

        if (this.lastClueIndex === 1)
            this.btn.setText("Un deuxième ?");
        else if (this.lastClueIndex === 2)
            this.btn.setText("Un troisième ?");
        else
            this.btn.setText("Encore un ?");

        // il y a encore un prochain indice
        if (this.lastClueIndex + 1 < this.clues.length) {
            this.cluesPanel.addControl(this.btn);
        }
    }
}