import { Colors } from "../../Shared/Colors";
import { BaseButton } from "./BaseButton";

export class OkButton extends BaseButton{
    constructor(callback: () => void, text?: string) {
        super("validate", text ?? "Valider", callback);
        this.background = Colors.Accent;
    }
}