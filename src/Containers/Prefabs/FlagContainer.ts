import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { DepartContainer } from "../DepartContainer";
import { Colors } from "../../Shared/Colors";

export class FlagContainer extends DepartContainer{

    constructor(root: GUI.Container, content_root:GUI.Container, scene: GameScene) {
        super(["Commencer par"], root, content_root, scene);
        this.bloc.background = Colors.Accent;
        this.shortName = "start";
    }

}