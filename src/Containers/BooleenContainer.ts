import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import type { Booleen } from "../Language/Booleen/Booleen";
import { BooleenBrut } from "../Language/Booleen/BooleenBrute";
import { Colors } from "../Shared/Colors";
import type { BlocData, BlockShortName } from "../Shared/types";
import { InputSlot } from "./InputSlot";

// Abstract d'un bloc contenant un booleen
export abstract class BooleenContainer extends BlocContainer {
    
    constructor(list: string[], root: GUI.Container, content_root: GUI.Container, scene: GameScene) {
            super("b", list, root, content_root, scene);
            //new DragBehavior(this);
        }
    
    build():void {
        this.background = Colors.PtitRoseDuSoir;
        super.build();
    }

    // Par défaut renvoie un faux (en pratique, cette fonction sera toujours override)
    public getValue(): (Booleen)[] {
        return [new BooleenBrut(false)];
    }

    override serialize(): BlocData {
        return {type: this.getShortName(), children: this.getSlots().map((slotWrapper: GUI.Rectangle) => {
            const slot = slotWrapper.children[0];
            console.log("processing slot ", slot);
            let ret;
            if (slot instanceof BlocContainer) ret =  slot.serialize();
            else if (slot instanceof InputSlot) ret =  slot.serialize();
            else ret =  null;

            console.log("processed, slot is ", ret);
            return ret;
        })};
    }
}

