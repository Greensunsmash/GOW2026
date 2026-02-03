import { Engine } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../../Containers/ValeurContainer";
import { BooleenContainer } from "../../Containers/BooleenContainer";
import { InstructionContainer } from "../../Containers/InstructionContainer";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene{
    //private player: Player;
    
    protected advancedTexture: GUI.AdvancedDynamicTexture;

    constructor(engine: Engine) {
        super(engine);

        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
        let i = new InstructionContainer(["Répéter", "v", "fois :"], this.advancedTexture, this);
        new BooleenContainer(["", "v", " = ", "v"], this.advancedTexture, this);
        new ValeurContainer(["10"], this.advancedTexture, this);
        new ValeurContainer(["10"], this.advancedTexture, this);
        let b = new InstructionContainer(["LALALAALALALALALALAL"], this.advancedTexture, this);
        i.addNext(b);
        

    }

    update(): void {
        //this.player.update();
    }
}