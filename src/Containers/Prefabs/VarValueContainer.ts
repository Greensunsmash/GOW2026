import * as GUI from "@babylonjs/gui";
import { ValeurContainer } from "../ValeurContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Valeur } from "../../Language/Valeur/Valeur";
import { VarValue } from "../../Language/Valeur/VarValue";

export class VarValueContainer extends ValeurContainer {

    name:string;

    // Rajouter un InputText. En attendant on va faire comme ça
    constructor(name:string, root: GUI.Container, content_root:GUI.Container, scene: GameScene) {
        super(["Variable " + name], root, content_root, scene);
        this.name = name;
    }

    public getValue(): (Valeur)[] {
        return [new VarValue(this.name, this)];
    }
} 