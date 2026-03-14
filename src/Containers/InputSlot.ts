import { InputText } from "@babylonjs/gui";
import type { ArgsType, BlocContainer } from "./BlocContainer";
import { EmptySlot } from "./EmptySlot";
import { Valeur } from "../Language/Valeur/Valeur";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import type { Vector2 } from "@babylonjs/core";
import type { Valuable } from "./Valuable";

export class InputSlot extends EmptySlot implements Valuable {
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

    getValue(): Valeur[] {
        const raw = this.textInput.text;
        const num = Number(raw);
        const val = isNaN(num) || raw === "" ? raw : num;
        return [new ValeurBrute(val)];
    }

    toString(): string {
        return "inputSlot" + this.id.toString();
    }
}