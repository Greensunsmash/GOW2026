// CD c'est pour la nostalge
// Playbar c'est pour barre de lecture

import { Container, Control, StackPanel } from "@babylonjs/gui";
import { BaseButton, IconButton } from "../buttons/BaseButton";
import { BaseHSpacer } from "../misc/BaseSpacers";
import { Memory } from "../../Language/Memory";

export const ICON_PLAY = "\ue037";
export const ICON_PAUSE = "\ue034";

// Une lecture ? Pas de pb, j'ai la barre
export class CDPlaybar extends Container {
    private panel: StackPanel;
    public multipleLeafMode = false;
    public firstBtn: IconButton;
    public backBtn: IconButton;
    public playBtn: IconButton;
    public nextBtn: IconButton;

    private onFullRun: () => void;
    private onPlayPause: () => void;

    constructor(
        root: Container,
        onFirst: () => void,
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
        

        /*pause : \ue88a
        play = \ue037
        frewind : \ue020
        ffoward: \ue01f
        first: \ue045*/

        this.firstBtn = new IconButton("first", "", "\ue045",  () => onFirst(), 50);
        this.firstBtn.shadowColor = "#00000065";
        this.backBtn = new IconButton("prev", "", "\ue020", () => onPrev(), 50);
        this.backBtn.shadowColor = "#00000065";
        this.playBtn = new IconButton("fullattempt", "Lancer", "\ue037", () => onFullRun(), 150);
        this.playBtn.shadowColor = "#00000065";
        this.nextBtn = new IconButton("next", "", "\ue01f", () => onNext(), 50);
        this.nextBtn.shadowColor = "#00000065";

        this.onFullRun = onFullRun;
        this.onPlayPause = onPlayPause;

        this.panel.addControl(this.firstBtn);
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
            this.playBtn.icon.text = ICON_PAUSE;
            this.playBtn.textBlk.text = "Pause";
            this.firstBtn.isEnabled = false;
            this.backBtn.isEnabled = false;
            this.nextBtn.isEnabled = false;
            if (playing) {
                this.playBtn.isEnabled = true;
                this.playBtn.setCallback(this.onPlayPause);
            } else {
                //this.playBtn.isEnabled = false;
            }
        } else {
            this.playBtn.isEnabled = true;
            if (atStart) {
                this.firstBtn.isEnabled = false;
                this.backBtn.isEnabled = false;
                this.nextBtn.isEnabled = true;
                this.playBtn.textBlk.text = this.multipleLeafMode ? "Tester ici" :  "Lancer";
                this.playBtn.icon.text = ICON_PLAY;
                this.playBtn.setCallback(this.onFullRun);
            } else if (hasEnded) {
                this.firstBtn.isEnabled = true;
                this.backBtn.isEnabled = true;
                this.nextBtn.isEnabled = false;
                this.playBtn.textBlk.text = this.multipleLeafMode ? "Retester ici" :  "Relancer";
                this.playBtn.icon.text = ICON_PLAY;
                this.playBtn.setCallback(this.onFullRun);
            } else {
                this.firstBtn.isEnabled = true;
                this.backBtn.isEnabled = true;
                this.nextBtn.isEnabled = true;
                this.playBtn.textBlk.text = "Continuer";
                this.playBtn.icon.text = ICON_PLAY;
                this.playBtn.setCallback(this.onPlayPause);
            }
        }
    }
}