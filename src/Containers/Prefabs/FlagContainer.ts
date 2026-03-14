import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { DepartContainer } from "../DepartContainer";

export class FlagContainer extends DepartContainer{

    constructor(root: GUI.Container, scene: GameScene) {
        super(["Première instruction"], root, scene);
        this.bloc.background = "#F52795";

    }

}