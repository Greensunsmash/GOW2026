import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";
import type { Valeur } from "../Language/Valeur/Valeur";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";

export class ValeurContainer extends BlocContainer {

    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super("v", list, root, scene);
        //new DragBehavior(this);
    }

    build():void {
        this.background = "#F58727";
        super.build();
    }

    // Par défaut renvoie un 1 (en pratique, cette fonction sera toujours override)
    public getValue(): (Valeur)[] {
            return [new ValeurBrute(1)];
        }

}