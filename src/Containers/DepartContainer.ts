import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { InstructionContainer } from "./InstructionContainer";

export class DepartContainer extends InstructionContainer {
    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super(list, root, scene);
        this.setFirstOnly(true);
        this.bloc.background = "#F52795";
    }
}