import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { BooleenContainer } from "../BooleenContainer";
import { BooleenBrut } from "../../Language/Booleen/BooleenBrute";
import type { Booleen } from "../../Language/Booleen/Booleen";

export class BooleenBrutContainer extends BooleenContainer {

    bool : boolean;

    // Rajouter un InputText. En attendant on va faire comme ça
    constructor(bool: boolean, root: GUI.Container, content_root:GUI.Container, scene: GameScene) {
        super([bool ? "Vrai" : "Faux"], root, content_root, scene);
        this.shortName = bool ? "true" : "false";
        this.bool = bool;
    }

    public getValue(): (Booleen)[] {
        return [new BooleenBrut(this.bool)];
    }
}