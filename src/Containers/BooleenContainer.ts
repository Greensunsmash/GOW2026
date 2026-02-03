import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import * as GUI from "@babylonjs/gui";
import { DragBehavior } from "./DragBehavior";


export class BooleenContainer extends BlocContainer {
    
    constructor(list: string[], advancedTexture: GUI.AdvancedDynamicTexture, scene: GameScene) {
            super("b", list, advancedTexture, scene);
            new DragBehavior(this);
        }
    
    build():void {
        this.background = "#95F527";
        super.build();
    }

    

}