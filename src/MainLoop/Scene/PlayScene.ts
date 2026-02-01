import { Engine } from "@babylonjs/core";
import { GameScene } from "./GameScene";

import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../../Containers/ValeurContainer";
import { BooleenContainer } from "../../Containers/BooleenContainer";
import { InstructionContainer } from "../../Containers/InstructionContainer";
import { EmptySlot } from "../../Containers/EmptySlot";
//import { Player } from "../entities/Player";

export class PlayScene extends GameScene{
    //private player: Player;
    
    protected advancedTexture: GUI.AdvancedDynamicTexture;

    constructor(engine: Engine) {
        super(engine);

        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
        new ValeurContainer(["On", "v", "ce", "a", "BabylonJS"], this.advancedTexture, this);
        new BooleenContainer(["encule"], this.advancedTexture, this);
        new InstructionContainer(["cher"], this.advancedTexture, this);
    }

    update(): void {
        //this.player.update();
    }
}