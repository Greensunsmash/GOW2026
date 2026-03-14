import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../ValeurContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Valeur } from "../../Language/Valeur/Valeur";
import { Moins } from "../../Language/Valeur/Moins";
import { isValuable } from "../Valuable";

export class MoinsContainer extends ValeurContainer {

    // Rajouter un InputText. En attendant on va faire comme ça
    // C'est inacceptable.
    constructor(root: GUI.Container, scene: GameScene) {
        super(["", "v", " - ", "v"], root, scene);
    }

    public getValue(): (Valeur)[] {
        let slots = this.getSlots();
        const child1 = slots[0].children[0];
        const child2 = slots[1].children[0];
        if (isValuable(child1) && isValuable(child2)) {
            return [new Moins(child1.getValue()[0], child2.getValue()[0])];
        }
        
        throw new Error("Reading a value on a non-value control. Fuck you");
    }
}