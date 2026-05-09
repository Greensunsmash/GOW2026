import { Instruction } from "./Instruction";
import { Valeur } from "../Valeur/Valeur";
import { Booleen } from "../Booleen/Booleen";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import type { Value } from "../Valeur/Value";
import type { InstructionContainer } from "../../Containers/InstructionContainer";

export class SetVar extends Instruction {
    private name: string;
    private valeur?: Valeur;
    private bool?: Booleen;
    private previous_value: Value | null = null;
    private previous_bool: boolean | null = null;

    constructor(name: string, arg: Valeur | Booleen, container : InstructionContainer) {
        super();
        this.name = name;
        this.container = container;
        if (arg instanceof Valeur) {
            this.valeur = arg;
        } else {
            this.bool = arg;
        }
    }

    async execute(): Promise<void> {
        if (this.valeur) {this.previous_value = Memory.get().getVariableValue(this.name); Memory.get().setVariable(this.name, this.valeur.eval());}
        if (this.bool) {this.previous_bool = Memory.get().getVariableBoolean(this.name); Memory.get().setVariable(this.name, this.bool.eval());}
        Memory.get().setCurrentInstruction(this);

        if (Memory.get().isPlaying()) this.next();
    }
    public back(): void {
        if (this.valeur) Memory.get().setVariable(this.name, this.previous_value);
        if (this.bool) Memory.get().setVariable(this.name, this.previous_bool);
        super.back()
    }

    onLaunch(l: Launchable): boolean {
        if (this.valeur) return this.valeur.onLaunch(l);
        if (this.bool) return this.bool.onLaunch(l);
        return false;
    }
}
