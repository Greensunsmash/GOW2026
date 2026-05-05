import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";
import type { Booleen } from "../Language/Booleen/Booleen";
import { BooleenBrut } from "../Language/Booleen/BooleenBrute";

// Abstract d'un bloc contenant un booleen
export abstract class BooleenContainer extends BlocContainer {
    
    constructor(list: string[], root: GUI.Container, content_root: GUI.Container, scene: GameScene) {
            super("b", list, root, content_root, scene);
            //new DragBehavior(this);
        }
    
    build():void {
        this.background = "#95F527";
        super.build();
    }

    // Par défaut renvoie un faux (en pratique, cette fonction sera toujours override)
    public getValue(): (Booleen)[] {
        return [new BooleenBrut(false)];
    }
    

}