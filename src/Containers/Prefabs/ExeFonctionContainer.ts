import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "../InstructionContainer";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import type { Instruction } from "../../Language/Instructions/Instruction";
import type { ValeurContainer } from "../ValeurContainer";
import { ExeFonction } from "../../Language/Instructions/ExeFonction";

export class ExeFonctionContainer extends InstructionContainer {

    name:string;
    nb:number;

    constructor(name:string, nb:number, root: GUI.Container, scene: GameScene){
        let list = ["Executer " + name + " "];
        for (let i=0; i<nb; i++) {list.push("v"); list.push("");}
        super(list, root, scene);
        this.name = name;
        this.nb = nb;
    }

    getInstruction(): Instruction {
        let e = new ExeFonction(this.name);
        let slots = this.getSlots();
        for (let i=0; i<this.nb; i++) e.addArgs((slots[0].children[0] as ValeurContainer).getValue()[0]);
        return e;
    }

}