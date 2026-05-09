import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Launchable } from "../../Language/Launchable";
import type { Executable } from "../../Language/Executable";
import { Fonction } from "../../Language/Group/Depart/Fonction";
import { DepartContainer } from "../DepartContainer";

export class FonctionContainer extends DepartContainer {
    name: string;
    args : string[];

    constructor(name:string, args:string[], root: GUI.Container, content_root:GUI.Container, scene: GameScene) {
        let s = "Fonction " + name + " (";
        let list = []
        for (const argname of args) {
            s +=  " " + argname + ",";
            //list.push("v");
            //s = "";
        }
        s = s.substring(0, s.length-1) + ")";
        list.push(s);
        super(list, root, content_root, scene);
        this.args = args;
        this.name = name;
    }

    getLaunchable(e:Executable[]):Launchable{
        let f = new Fonction(this.name, this, e);
        for (const arg of this.args) f.addArgs(arg);
        return f;
    }
}