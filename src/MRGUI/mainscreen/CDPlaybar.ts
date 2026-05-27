// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, Control, StackPanel } from "@babylonjs/gui";
import { BaseButton } from "../buttons/BaseButton";
import { BaseHSpacer } from "../misc/BaseSpacers";
import { Memory } from "../../Language/Memory";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends Container {
    private panel: StackPanel;
    public multipleLeafMode = false;
    public backBtn: BaseButton;
    public playBtn: BaseButton;
    public nextBtn: BaseButton;

    private onFullRun: () => void;
    private onPlayPause: () => void;

    constructor(
        root: Container,
        onPrev: () => void,
        onNext: () => void,
        onFullRun: () => void,
        onPlayPause: () => void
    ) {
        super("cdplaybar");

        //this.width = "200px";
        this.height = "40px";
        //this.adaptHeightToChildren = true;
        this.adaptWidthToChildren = true;
        this.clipChildren = false;
        this.clipContent = false;
        //this.zIndex = 100;

        this.panel = new StackPanel();
        this.panel.isVertical = false;
        this.panel.clipChildren = false;
        this.panel.clipContent = false;
        


        this.backBtn = new BaseButton("prev", "⏪︎   Action d'avant", () => onPrev(), 200);
        this.playBtn = new BaseButton("fullattempt", "▶   Lancer", () => onFullRun(), 0);
        this.nextBtn = new BaseButton("next", "Action d'après   ⏩︎", () => onNext(), 200);

        this.onFullRun = onFullRun;
        this.onPlayPause = onPlayPause;

        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(this.backBtn);
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(this.playBtn);
        this.panel.addControl(new BaseHSpacer());
        this.panel.addControl(this.nextBtn);
        //this.panel.addControl(new BaseHSpacer());
        //this.panel.addControl(new BaseButton("last", "⏭", () => onLast(), 30));
        this.addControl(this.panel);
    }

    public switchMode(multipleLeaf: boolean) {
        this.multipleLeafMode = multipleLeaf;
    }

    public triggerUpdate() {
        const playing = Memory.get().isPlaying();
        const moving = Memory.get().isCurrentlyMoving();
        const atStart = !Memory.get().getCurrentInstruction();
        const hasEnded = Memory.get().hasEnded();

        if (moving) {
            this.backBtn.isEnabled = false;
            this.nextBtn.isEnabled = false;
            if (playing) {
                this.playBtn.isEnabled = true;
                this.playBtn.setText("⏸️ Pause");
                this.playBtn.setCallback(this.onPlayPause);
            } else {
                this.playBtn.isEnabled = false;
            }
        } else {
            this.playBtn.isEnabled = true;
            if (atStart) {
                this.backBtn.isEnabled = false;
                this.nextBtn.isEnabled = true;
                this.playBtn.setText(this.multipleLeafMode ? "▶   Tester ici" :  "▶   Lancer");
                this.playBtn.setCallback(this.onFullRun);
            } else if (hasEnded) {
                this.backBtn.isEnabled = true;
                this.nextBtn.isEnabled = false;
                this.playBtn.setText(this.multipleLeafMode ? "▶   Retester ici" :  "▶   Relancer");
                this.playBtn.setCallback(this.onFullRun);
            } else {
                this.backBtn.isEnabled = true;
                this.nextBtn.isEnabled = true;
                this.playBtn.setText("▶   Continuer");
                this.playBtn.setCallback(this.onPlayPause);
            }
        }
    }
}