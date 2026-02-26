import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { ListContainer } from "./ListContainer";

export class StructureContainer  {

    private l : ListContainer;
    private header : InstructionContainer;
    private queue : InstructionContainer;

    constructor(l:ListContainer, header:InstructionContainer, queue:InstructionContainer) {
        this.l = l;
        this.header = header;
        this.queue = queue;
    }

    public contains(id:number): boolean {
        return this.getHeaderID() < id && this.getQueueID() > id;
    }
    

    // GETTERS / SETTERS
    public getHeader():InstructionContainer {return this.header;}
    public getQueue():InstructionContainer {return this.queue;}
    public getHeaderID():number{return this.l.getIdInstruction(this.header);}
    public getQueueID():number{return this.l.getIdInstruction(this.queue);}
    public setList(l:ListContainer):void {this.l = l;}

}