import { InstructionContainer } from "./InstructionContainer";
import type { ListContainer } from "./ListContainer";
import type { Executable } from "../Language/Executable";
import { Pour } from "../Language/Group/Structure/Pour";
import type { InstructionData } from "../Shared/types";


// Abstract qui représente une structure, qui est simplement des infos sur le début et la fin de la boucle
export abstract class StructureContainer  {

    private l : ListContainer;
    private readonly header : InstructionContainer;
    private readonly mid : InstructionContainer | undefined;
    private readonly queue : InstructionContainer;

    constructor(l:ListContainer, header:InstructionContainer, queue:InstructionContainer, queue2?:InstructionContainer) {
        this.l = l;
        this.header = header;
        if (queue2) {
            this.queue = queue2;
            this.mid = queue;
        } else this.queue = queue;
    }

    public contains(id:number): boolean {
        if (this.mid) return (this.getHeaderID() < id && this.getMidID() > id) || (this.getMidID() < id && this.getQueueID() > id);
        return this.getHeaderID() < id && this.getQueueID() > id;
    }

    public getGroup(e:Executable[], e2?:Executable[]): Executable {return new Pour(e);}

    // GETTERS / SETTERS
    public getHeader():InstructionContainer {return this.header;}
    public getQueue():InstructionContainer {return this.queue;}
    public getMid():InstructionContainer | undefined {return this.mid;}
    public getHeaderID():number{return this.l.getIdInstruction(this.header);}
    public getQueueID():number{return this.l.getIdInstruction(this.queue);}
    public getMidID():number | undefined {if (this.mid) return this.l.getIdInstruction(this.mid); else return undefined}
    public setList(l:ListContainer):void {this.l = l;}

}