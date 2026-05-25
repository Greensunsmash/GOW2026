import { Colors } from "../../Shared/Colors";
import { BaseButton } from "./BaseButton";

export class OkButton extends BaseButton{
    constructor(callback: () => void) {
        super("validate", "Valider", callback);
        this.background = Colors.Accent;
    }
}