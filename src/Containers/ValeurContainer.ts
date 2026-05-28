import * as GUI from "@babylonjs/gui";
import type { Valeur } from "../Language/Valeur/Valeur";
import { ValeurBrute } from "../Language/Valeur/ValeurBrute";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import type { Valuable } from "./Valuable";
import { Colors } from "../Shared/Colors";
import type { BlocData } from "../Shared/types";
import { InputSlot } from "./InputSlot";

// Abstract pour tout les bloc renvoyant une valeur
export class ValeurContainer extends BlocContainer implements Valuable {

    constructor(list: string[], root: GUI.Container, content_root: GUI.Container, scene: GameScene) {
        super("v", list, root, content_root, scene);
        //new DragBehavior(this);
    }

    build():void {
        // Met le fond en blorange (F587jet27)
        this.background = Colors.PtitRoseDuSoir;
        super.build();
    }

    // Par défaut renvoie un 1 (en pratique, cette fonction sera toujours override)
    public getValue(): (Valeur)[] {return [new ValeurBrute(1)];}

    override serialize(): BlocData {
        return {type: this.getShortName(), children: this.getSlots().map((slotWrapper: GUI.Rectangle) => {
            console.log("processing slot wrp", slotWrapper);
            const slot = slotWrapper.children[0];
            let ret;
            if (slot instanceof BlocContainer) ret =  slot.serialize();
            else if (slot instanceof InputSlot) ret =  slot.serialize();
            else ret =  null;

            console.log("processed, slot is ", ret);
            return ret;
        })};
    }
}