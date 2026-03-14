import * as GUI from "@babylonjs/gui";
import type { Booleen } from "../Language/Booleen/Booleen";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BooleenContainer } from "./BooleenContainer";

export class BasicBooleenContainer extends BooleenContainer {
    private bool: Booleen;

    constructor(name:string, bool: Booleen, root: GUI.Container, scene: GameScene) {
        super([name], root, scene);
        this.bool = bool;
    }

    public getValue(): (Booleen)[] {
        return [this.bool];
    }
}