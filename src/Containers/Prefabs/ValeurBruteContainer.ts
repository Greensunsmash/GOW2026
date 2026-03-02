import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../ValeurContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Valeur } from "../../Language/Valeur/Valeur";
import { ValeurBrute } from "../../Language/Valeur/ValeurBrute";

export class ValeurBruteContainer extends ValeurContainer {

    nb : number;

    // Rajouter un InputText. En attendant on va faire comme ça
    constructor(valeur: number, root: GUI.Container, scene: GameScene) {
        super([valeur.toString()], root, scene);
        this.nb = valeur;
    }

    public getValue(): (Valeur)[] {
        return [new ValeurBrute(this.nb)];
    }
}