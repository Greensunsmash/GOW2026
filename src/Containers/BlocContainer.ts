import * as GUI from "@babylonjs/gui";
import { EmptySlot } from "./EmptySlot";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { Valeur } from "../Language/Valeur/Valeur";
import type { Booleen } from "../Language/Booleen/Booleen";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import { Vector2 } from "@babylonjs/core";

export type ArgsType = "VALEUR" | "BOOLEEN" | "ALL" | "NONE";

// Cette classe repésente la base d'un bloc scratch. Return une liste de Valeur
export class BlocContainer extends GUI.Rectangle {

    private readonly container: GUI.StackPanel;
    private readonly labels: GUI.TextBlock[];
    private readonly args: ArgsType[];
    private readonly slots: GUI.Rectangle[];
    private readonly root: GUI.Container;
    private readonly scene: GameScene;
    private readonly type : ArgsType;

    constructor(type:string, list: string[], root: GUI.Container, scene: GameScene) {
        super();

        switch (type) {
            case "v": this.type = "VALEUR"; break;
            case "b": this.type = "BOOLEEN"; break;
            default : this.type = "NONE"; break;
        }

        this.labels = [];
        this.slots = [];
        this.args = [];
        this.root = root;
        this.scene = scene;
        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        // Initialisation du container (qui contient les textes et les slots)
        this.container = new GUI.StackPanel();
        this.container.isVertical = false;
        this.container.adaptWidthToChildren = true;
        this.container.adaptHeightToChildren = true;
        this.container.isHitTestVisible = false;
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
                label.paddingTop = "10px";
                label.paddingBottom = "10px";
                label.isHitTestVisible = false;

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
                slotWrapper.isHitTestVisible = false;

                const slot = new EmptySlot(this, this.args[this.args.length - 1]);
                slotWrapper.addControl(slot);

                this.slots.push(slotWrapper);
                this.container.addControl(slotWrapper);
            }
        }

        this.root.addControl(this);
        this.build();
    }

    // Préparations finales du rectangle (fonction destinée à être override (NOPE TRES MAUVAISE IDEE))
    protected build(): void {
        this.cornerRadius = 10;
        this.color = "white";
        this.thickness = 2;

        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
    }

    // Insérer un bloc dans un slot
    public insertControlAt(control: BlocContainer, slotWrapper: GUI.Rectangle): void {
        if (!slotWrapper) {
            console.log("Pas de Wrapper ?????????");
            return;
        }

        if (control.parent) {control.parent.removeControl(control);}

        let nb:number;
        for (nb= 0; nb<slotWrapper.children.length; nb++) slotWrapper.children[nb].dispose();

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
        //console.log(i);
        slotWrapper.clearControls();
        slotWrapper.addControl(new EmptySlot(this, this.args[i]));
    }

    // Fonction de base pour récupérer la valeur, se contente de renvoyer une liste des valeurs données
    public getValue(): (Valeur | Booleen)[] {
        return this.slots.map((slot : GUI.Rectangle) => {
            if (slot instanceof BlocContainer) return slot.getValue()[0]
            return new ValeurBrute(0);  
        })
    }

    // Renvoie si le point donné appartient à ce bloc où un bloc enfant
    public isPointHandle(coords : Vector2): (GUI.Rectangle | null) {
        for (let i=0; i<this.slots.length; i++) {
            let s = this.slots[i].children[0]; // Normalement le wrapper a un seul enfant
            if (s instanceof BlocContainer) {
                let result = s.isPointHandle(coords);
                if (result) return result;
            }
        }
        if (this.contains(coords.x, coords.y)) return this;
        return null;
    }

    // NE PAS TOUCHER
    unableSlotHovering():void {}
    enableSlotHovering():void {}

    // Getters
    public getSlots(): readonly GUI.Rectangle[] {return this.slots;}
    public getContainer(): GUI.StackPanel {return this.container;}
    public getRoot(): GUI.Container {return this.root;}
    public getScene(): GameScene {return this.scene;}
    public getArgs(): readonly ArgsType[] {return this.args;}
    public getLabels(): readonly GUI.TextBlock[] {return this.labels;}
    public getType(): ArgsType {return this.type;}
}




