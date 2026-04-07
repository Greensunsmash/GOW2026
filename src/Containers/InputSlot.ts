import { InputText, Vector2WithInfo } from "@babylonjs/gui";
import type { ArgsType, BlocContainer } from "./BlocContainer";
import { EmptySlot } from "./EmptySlot";
import { Valeur } from "../Language/Valeur/Valeur";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import type { Observer, Vector2 } from "@babylonjs/core";
import type { Valuable } from "./Valuable";

export class InputSlot extends EmptySlot implements Valuable {
    private textInput: InputText;
    private dragObserver: () => void;
    private undragObserver: () => void;
    private clickObserver: Observer<Vector2WithInfo>;

    constructor(parent:BlocContainer, type:ArgsType) {
        super(parent, type);

        this.textInput = new InputText("inputSlot" + this.id.toString(), "");
        this.textInput.color = "#ffffff"
        this.textInput.height = "100%";
        this.textInput.width = "100%";
        this.textInput.isHitTestVisible = false;
        this.textInput.isPointerBlocker = true;
        this.addControl(this.textInput);

        this.clickObserver = this.onPointerDownObservable.add(() => {
            this.textInput.focus(); 
        });
        this.dragObserver = () => { if (this.textInput) this.textInput.isHitTestVisible = false; };
        this.undragObserver = () => { if (this.textInput) this.textInput.isHitTestVisible = true; };
        
        this.scene.dragListeners.push(this.dragObserver);
        this.scene.undragListeners.push(this.undragObserver);
    }

    init() {
        super.init();
    }

    isPointHandle(coords: Vector2) {
        console.log("ispointhandle, inputslot");
        if (this.contains(coords.x, coords.y)) return this;
        return null;
    }

    getValue(): Valeur[] {
        const raw = this.textInput.text;
        console.log("read raw from input slot ", raw);
        const num = Number(raw);
        const val = isNaN(num) || raw === "" ? raw : num;
        console.log("number turned to ", val);
        return [new ValeurBrute(val)];
    }

    toString(): string {
        return "inputSlot" + this.id.toString();
    }

    dispose(): void {
        this.scene.dragListeners = this.scene.dragListeners.filter(l => l !== this.dragObserver);
        this.scene.undragListeners = this.scene.undragListeners.filter(l => l !== this.undragObserver);
        if (this.clickObserver) this.onPointerDownObservable.remove(this.clickObserver);
        this.textInput.dispose();
        super.dispose();
    }
}