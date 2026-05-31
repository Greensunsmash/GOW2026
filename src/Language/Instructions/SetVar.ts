import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Booleen } from "../Booleen/Booleen";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import type { Value } from "../Valeur/Value";
import type { InstructionContainer } from "../../Containers/InstructionContainer";
import type { ExecutionContext } from "../../MainLoop/ExecutionContext";

export class SetVar extends Instruction {
    private name: string;
    private valeur?: Valeur;
    private bool?: Booleen;
    private previous_value: Value | null = null;
    private previous_bool: boolean | null = null;
    private ctx: ExecutionContext;

    constructor(name: string, arg: Valeur | Booleen, container : InstructionContainer, ctx:ExecutionContext) {
        super();
        this.name = name;
        this.container = container;
        if (arg instanceof Valeur) {
            this.valeur = arg;
        } else {
            this.bool = arg;
        }
        this.ctx = ctx;
    }

    async execute(): Promise<void> {
        this.gameModeAtExecute = Memory.get().getGameMode();
        if (this.gameModeAtExecute === "PIGMODE")
            await this.ctx.nextTick(this.ctx.getRobot().getNextPosIntention("forward"), Memory.get().skip);
        else {
            if (this.valeur) {this.previous_value = Memory.get().getVariableValue(this.name); Memory.get().setVariable(this.name, this.valeur.eval());}
            if (this.bool) {this.previous_bool = Memory.get().getVariableBoolean(this.name); Memory.get().setVariable(this.name, this.bool.eval());}
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        Memory.get().setCurrentInstruction(this);

        if (Memory.get().isPlaying()) this.next();
    }
    public async back(): Promise<void> {

        if (this.gameModeAtExecute === "PIGMODE") {
            if (Memory.get().skip) this.ctx.getRobot().moveBackward();
            else await this.ctx.getRobot().visualMoveBackward();

            await this.ctx.prevTick();
        } else {
            if (this.valeur) Memory.get().setVariable(this.name, this.previous_value);
            if (this.bool) Memory.get().setVariable(this.name, this.previous_bool);
        }
        super.back()
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur) return this.valeur.onLaunch(l);
        if (this.bool) return this.bool.onLaunch(l);
        return false;
    }
}
