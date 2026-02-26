import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";

export class StructureContainer  {

    private header : InstructionContainer;
    private queue : InstructionContainer;
    private headID : number;
    private queueID : number;

    constructor(header:InstructionContainer, queue:InstructionContainer,first:number, last:number) {
        this.header = header;
        this.queue = queue;
        this.headID = first;
        this.queueID = last;
    }

    public updateAdd(id:number) {
        if (this.headID >= id) this.headID += 1;
        if (this.queueID >= id) this.queueID += 1;
    }

    public updateRetreat(id:number) {
        if (this.headID >=  id) this.headID -= 1;
        if (this.queueID >= id) this.queueID -= 1;
    }

    public contains(id:number): boolean {
        return this.headID < id && this.queueID > id;
    }

    public add(nb:number):void {
        this.headID = this.headID + nb;
        this.queueID = this.queueID + nb;
    }
    

    // GETTERS
    public getHeader():InstructionContainer {return this.header;}
    public getQueue():InstructionContainer {return this.queue;}
    public getHeaderID():number{return this.headID;}
    public getQueueID():number{return this.queueID;}

}