import { Colors } from "../../Shared/Colors";
import { BaseButton } from "./BaseButton";

export class CancelButton extends BaseButton{
    constructor(callback: () => void) {
        super("cancel", "Annuler", callback);
        this.background = Colors.AccentDuSud;
    }
}