import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { ListContainer } from "./ListContainer";
import type { Executable } from "../Language/Executable";
import { Pour } from "../Language/Group/Structure/Pour";

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

    public getGroup(e:Executable[]): Executable {return new Pour(e);}
    

    // GETTERS / SETTERS
    public getHeader():InstructionContainer {return this.header;}
    public getQueue():InstructionContainer {return this.queue;}
    public getHeaderID():number{return this.l.getIdInstruction(this.header);}
    public getQueueID():number{return this.l.getIdInstruction(this.queue);}
    public setList(l:ListContainer):void {this.l = l;}

}