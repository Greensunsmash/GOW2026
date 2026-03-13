import { InputText } from "@babylonjs/gui";
import type { ArgsType, BlocContainer } from "./BlocContainer";
import { EmptySlot } from "./EmptySlot";
import { Valeur } from "../Language/Valeur/Valeur";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import type { Vector2 } from "@babylonjs/core";

export class InputSlot extends EmptySlot {
    private textInput: InputText;

    constructor(parent:BlocContainer, type:ArgsType) {
        super(parent, type);

        this.textInput = new InputText("inputSlot" + this.id.toString(), "");
        this.textInput.color = "#ffffff"
        this.textInput.height = "100%";
        this.textInput.width = "100%";
        this.textInput.isHitTestVisible = true;
        this.addControl(this.textInput);

        this.onPointerDownObservable.add(() => this.textInput.focus());
        this.scene.dragListeners.push(() => this.textInput.isHitTestVisible = false);
        this.scene.undragListeners.push(() => this.textInput.isHitTestVisible = true);
    }

    init() {
        super.init();
    }

    isPointHandle(coords: Vector2) {
        if (this.contains(coords.x, coords.y)) return this;
        return null;
    }

    getValue(): Valeur {
        console.error("value asked");
        let val: number | string;
        try {
            val = Number(this.textInput.text);
        } catch (err) {
            val = this.textInput.text;
        }
        console.error("i will return :");
        console.warn(val);
        console.warn(typeof val);
        return new ValeurBrute(val);
    }

    toString(): string {
        return "inputSlot" + this.id.toString();
    }
}