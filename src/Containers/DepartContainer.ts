import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { InstructionContainer } from "./InstructionContainer";
import type { Launchable } from "../Language/Launchable";
import type { Executable } from "../Language/Executable";
import { Flag } from "../Language/Group/Depart/Flag";

export abstract class DepartContainer extends InstructionContainer {
    constructor(list: string[], root: GUI.Container, scene: GameScene) {
        super(list, root, scene);
        this.bloc.background = "#F52795";
    }

    getLaunchable(e:Executable[]):Launchable{return new Flag(e);}
}