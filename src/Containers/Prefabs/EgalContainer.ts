import * as GUI from "@babylonjs/gui";
import type { Booleen } from "../../Language/Booleen/Booleen";
import { Egal } from "../../Language/Booleen/Egal";
import type { Valeur } from "../../Language/Valeur/Valeur";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { BooleenContainer } from "../BooleenContainer";
import { isValuable } from "../Valuable";

export class EgalContainer extends BooleenContainer {

    // Rajouter un InputText. En attendant on va faire comme ça
    // C'est inacceptable.
    constructor(root: GUI.Container, scene: GameScene) {
        super(["", "v", " = ", "v"], root, scene);
    }

    public getValue(): (Booleen)[] {
        let slots = this.getSlots();
        const child1 = slots[0].children[0];
        const child2 = slots[1].children[0];
        if (isValuable(child1) && isValuable(child2)) {
            return [new Egal(child1.getValue()[0] as Valeur, child2.getValue()[0] as Valeur)];
        }
        
        throw new Error("Reading a value on a non-value control. Fuck you");
    }
}