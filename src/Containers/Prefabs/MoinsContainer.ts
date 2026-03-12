import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../ValeurContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Valeur } from "../../Language/Valeur/Valeur";
import { Moins } from "../../Language/Valeur/Moins";

export class MoinsContainer extends ValeurContainer {

    // Rajouter un InputText. En attendant on va faire comme ça
    // C'est inacceptable.
    constructor(root: GUI.Container, scene: GameScene) {
        super(["", "v", " - ", "v"], root, scene);
    }

    public getValue(): (Valeur)[] {
        let slots = this.getSlots();
        let v1 = slots[0].children[0] as ValeurContainer;
        let v2 = slots[1].children[0] as ValeurContainer;
        return [new Moins(v1.getValue()[0], v2.getValue()[0])];
    }
}