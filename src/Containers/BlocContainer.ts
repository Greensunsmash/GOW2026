import * as GUI from "@babylonjs/gui";
import { EmptySlot } from "./EmptySlot";
import { DragBehavior } from "./DragBehavior";
import type { GameScene } from "../MainLoop/Scene/GameScene";

export type ArgsType = "VALEUR" | "BOOLEEN" | "ALL" | "NONE";

// Cette classe repésente la base d'un bloc scratch
export class BlocContainer extends GUI.Rectangle {

    private readonly container: GUI.StackPanel;
    private readonly labels: GUI.TextBlock[];
    private readonly args: ArgsType[];
    private readonly slots: GUI.Rectangle[];
    private readonly advancedTexture: GUI.AdvancedDynamicTexture;
    private readonly scene: GameScene;
    private readonly type : ArgsType;

    constructor(type:string, list: string[], advancedTexture: GUI.AdvancedDynamicTexture, scene: GameScene) {
        super();

        switch (type) {
            case "v": this.type = "VALEUR"; break;
            case "b": this.type = "BOOLEEN"; break;
            default : this.type = "NONE"; break;
        }

        this.labels = [];
        this.slots = [];
        this.args = [];
        this.advancedTexture = advancedTexture;
        this.scene = scene;

        // Initialisation du container (qui contient les textes et les slots)
        this.container = new GUI.StackPanel();
        this.container.isVertical = false;
        this.container.adaptWidthToChildren = true;
        this.container.adaptHeightToChildren = true;
        this.addControl(this.container);

        for (let i = 0; i < list.length; i++) {
            if (i % 2 === 0) {
                if (list[i] === "") continue;
                const label = new GUI.TextBlock();
                label.text = list[i];
                label.color = "white";
                label.fontSize = 14;
                label.resizeToFit = true;
                label.paddingLeft = "10px";
                label.paddingRight = "10px";

                this.labels.push(label);
                this.container.addControl(label);
            } else {
                switch (list[i]) {
                    case "v": this.args.push("VALEUR"); break;
                    case "b": this.args.push("BOOLEEN"); break;
                    case "a": this.args.push("ALL"); break;
                }

                const slotWrapper = new GUI.Rectangle();
                slotWrapper.adaptWidthToChildren = true;
                slotWrapper.adaptHeightToChildren = true;
                slotWrapper.color = "transparent";

                const slot = new EmptySlot(this, this.args[this.args.length - 1]);
                slotWrapper.addControl(slot);

                this.slots.push(slotWrapper);
                this.container.addControl(slotWrapper);
            }
        }

        this.advancedTexture.addControl(this);
        this.build();
    }

    // Préparations finales du rectangle (fonction destinée à être override)
    protected build(): void {
        this.cornerRadius = 10;
        this.color = "white";
        this.thickness = 2;

        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
    }

    // Insérer un bloc dans un slot
    public insertControlAt( control: BlocContainer, slotWrapper: GUI.Rectangle): void {
        if (!slotWrapper) return;

        if (control.parent) {
            control.parent.removeControl(control);
        }

        slotWrapper.clearControls();
        slotWrapper.addControl(control);

        control.left = 0;
        control.top = 0;
        control.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        control.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    }

    // Réinitialiser un slot
    public resetEmptySlot(slotWrapper: GUI.Rectangle): void {
        if (!slotWrapper) return;

        let i:number;
        for (i=0; i<this.slots.length; i++) {
            if (slotWrapper === this.slots[i]) break;
        }
        console.log(i);
        slotWrapper.clearControls();
        slotWrapper.addControl(new EmptySlot(this, this.args[i]));
    }

    // Getters
    public getSlots(): readonly GUI.Rectangle[] {return this.slots;}
    public getContainer(): GUI.StackPanel {return this.container;}
    public getTexture(): GUI.AdvancedDynamicTexture {return this.advancedTexture;}
    public getScene(): GameScene {return this.scene;}
    public getArgs(): readonly ArgsType[] {return this.args;}
    public getLabels(): readonly GUI.TextBlock[] {return this.labels;}
    public getType(): ArgsType {return this.type;}

}




