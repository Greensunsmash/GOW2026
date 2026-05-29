import { Colors } from "../../Shared/Colors";
import { BaseButton } from "./BaseButton";

export class CancelButton extends BaseButton{
    constructor(callback: () => void, text?: string) {
        super("cancel", text ?? "Annuler", callback);
        this.background = Colors.AccentDuSud;
    }
}