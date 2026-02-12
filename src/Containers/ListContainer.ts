import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import { Magnet } from "./Magnet";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { Instruction } from "../Language/Instructions/Instruction";

// La classe qui permet de stocker plusieurs instructions container à la suite
export class ListContainer extends GUI.Rectangle {
    private list : (InstructionContainer | Magnet)[];
    private stack : GUI.StackPanel;
    private detector : GUI.Rectangle;

    constructor(root: GUI.Container, scene: GameScene) {
        super();
        this.list = [];

        this.detector = new GUI.Rectangle();
        this.detector.height = "20px";
        this.detector.width = "100px";

        this.stack = new GUI.StackPanel();

        root.addControl(this);
        this.addControl(this.detector);
        this.addControl(this.stack);
    }

    addInstruction(c: InstructionContainer, index : number) {
        if (c.parent) {c.parent.removeControl(c);}

        let nb:number;
        let memory : (InstructionContainer | Magnet)[] =[c];
        for (nb=this.list.length-1; nb>=index; nb--) {
            memory.push(this.list[nb]);
            this.stack.removeControl(this.list[nb])
            this.list.pop();
        }
        for (var key in memory) {
            this.stack.addControl(memory[key]);
            this.list.push(memory[key]);
        }

        this.detector.width = "100%";
        this.detector.height = "100%";
    }

    removeInstruction(c:InstructionContainer) {
        if (this.list.length <= 1) return ;

        let nb = this.list.indexOf(c);
        this.stack.removeControl(c);
        this.list.splice(nb, 1);
    }

    getListInstruction() : (Instruction[]) {
        let l = this.list.filter((x:InstructionContainer | Magnet) => x instanceof InstructionContainer);
        return l.map(((x:InstructionContainer) => x.getInstruction()));
    }
}
