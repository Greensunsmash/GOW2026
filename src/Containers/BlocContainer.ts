import * as GUI from "@babylonjs/gui";
import { EmptySlot } from "./EmptySlot";
import { DragBehavior } from "./DragBehavior";
import type { GameScene } from "../MainLoop/Scene/GameScene";

export type ArgsType = "VALEUR" | "BOOLEEN" | "ALL";

export abstract class BlocContainer extends GUI.Rectangle {

    private container: GUI.StackPanel;
    protected labels: GUI.TextBlock[];
    protected slots: GUI.Rectangle[];
    protected args: ArgsType[];
    protected advancedTexture: GUI.AdvancedDynamicTexture;
    protected scene: GameScene;

    constructor(list: string[], advancedTexture: GUI.AdvancedDynamicTexture, scene: GameScene) {
        super();

        this.labels = [];
        this.slots = [];
        this.args = [];
        this.advancedTexture = advancedTexture;
        this.scene = scene;
        console.log("[BlocContainer] constructor start");

        this.container = new GUI.StackPanel();
        this.container.isVertical = false;
        this.container.adaptWidthToChildren = true;
        this.container.adaptHeightToChildren = true;
        this.addControl(this.container);

        for (let i = 0; i < list.length; i++) {
            if (i % 2 === 0) {
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
                slotWrapper.width = "50px";
                slotWrapper.height = "50px";
                slotWrapper.adaptWidthToChildren = true;
                slotWrapper.adaptHeightToChildren = true;
                slotWrapper.color = "transparent";

                const slot = new EmptySlot(this, scene);
                slotWrapper.addControl(slot);

                this.slots.push(slotWrapper);
                this.container.addControl(slotWrapper);

                console.log("[BlocContainer] slot ajouté", slotWrapper, slot);
            }
        }

        advancedTexture.addControl(this);

        new DragBehavior(this, scene);

        this.build();

        console.log("[BlocContainer] constructor end, labels:", this.labels, "slots:", this.slots);
    }

    protected build(): void {
        this.cornerRadius = 10;
        this.color = "white";
        this.thickness = 2;
        this.isPointerBlocker = true;

        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
    }

    public insertControlAt(control: BlocContainer, slotWrapper: GUI.Rectangle) {
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

        console.log("[insertControlAt] after addControl, slotWrapper children:", slotWrapper.children);
    }

    public resetEmptySlot(slotWrapper: GUI.Rectangle) {
        if (!slotWrapper) return;

        slotWrapper.clearControls();
        slotWrapper.addControl(new EmptySlot(this, this.scene));

    }

    public getSlots(): GUI.Rectangle[] {
        return this.slots;
    }

    public getContainer(): GUI.StackPanel {
        return this.container;
    }

    public getTexture() : GUI.AdvancedDynamicTexture {return this.advancedTexture;}
}



