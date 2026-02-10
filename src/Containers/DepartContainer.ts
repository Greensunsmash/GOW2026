import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { InstructionContainer } from "./InstructionContainer";

export class DepartContainer extends InstructionContainer {
    // Crée une instance de DepartContainer
    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super(list, root, scene);
        this.setFirstOnly(true);
        // Met la couleur du bloc en blouge (F52795)
        this.bloc.background = "#F52795";
    }
}