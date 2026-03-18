import * as GUI from "@babylonjs/gui";
import type { Valeur } from "../Language/Valeur/Valeur";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import type { Valuable } from "./Valuable";

// Abstract pour tout les bloc renvoyant une valeur
export class ValeurContainer extends BlocContainer implements Valuable {

    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super("v", list, root, scene);
        //new DragBehavior(this);
    }

    build():void {
        // Met le fond en blorange (F587jet27)
        this.background = "#F58727";
        super.build();
    }

    // Par défaut renvoie un 1 (en pratique, cette fonction sera toujours override)
    public getValue(): (Valeur)[] {return [new ValeurBrute(1)];}

}