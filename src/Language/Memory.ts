import type { Executable } from "./Executable";
import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";

export type StackFrame = {
    funcName: string;
    variables: Map<string, Value>;
};

export class Memory {
    private static instance: Memory;

    private values: Map<String, Value>;
    private booleans: Map<String, boolean>;
    private fonctions: Map<String, Fonction>;

    private callStack: StackFrame[];
    private historyID:number;

    private playing = false;
    private current_instruction : Executable | undefined;
    private skip = false;

    private constructor() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.historyID = 0;
    }

    clear() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.historyID = 0;
    }

    // Singleton
    public static get(): Memory {
        if (!Memory.instance) {
            Memory.instance = new Memory();
        }
        return Memory.instance;
    }

    public setVariable(name: string, val: Value | boolean | null): void { // null a pour effet de supprimer la variable
        if (!val) {
            if (this.callStack.length > 0) {
                const frame = this.callStack[this.callStack.length - 1];
                frame.variables.delete(name);
            } else {
                this.values.delete(name);
            }
        }
        else if (val instanceof Value) {
            if (this.callStack.length > 0) {
                const frame = this.callStack[this.callStack.length - 1];
                frame.variables.set(name, val);
            } else {
                this.values.set(name, val);
            }
        } else {
            this.booleans.set(name, val);
        }
    }
    public getVariableValue(name: string): Value | null{
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            const frame = this.callStack[i];
            if (frame.variables.has(name)) {
                return frame.variables.get(name) ?? new Value("Error");
            }
        }

        return this.values.get(name) ?? null;
    }
    // Il faut refaire toute la logique concernant les booleens
    public getVariableBoolean(name: string): boolean | null {return this.booleans.get(name) ?? null;}

    public setFonction(name: string, func: Fonction): void { this.fonctions.set(name, func);}
    public getFonction(name: string): Fonction | undefined { return this.fonctions.get(name);}
    
    public newFonctionCall(name: string, map: Map<string, Value>): void {
        if (this.callStack.length >= 100) throw new Error("stack overflow");
        this.callStack.push({funcName: name, variables: map});
    }
    public endFonction(name: string): StackFrame | null {
        if (this.callStack.length > 0) return this.callStack.pop(); // error askip mais non vu que j'ai verif juste avant
        return null
    }
    public stackComeback(bg : StackFrame):void {
        this.callStack.push(bg);
    }
    
    public stepBack() : void {
        console.log(this.current_instruction);
        this.current_instruction?.back();
        Memory.print();
    }
    public nextStep() : void {
        if (this.current_instruction) this.current_instruction.next();
        Memory.print();
    }

    public programEnd() : void {
        console.log("On est arrivé à la fin");
    }

    // GETTERS / SETTERS
    public isPlaying():boolean {return this.playing;}
    public setPlaying(bool : boolean):void {this.playing = bool;}
    public resetCurrentInstruction():void {this.current_instruction = undefined;}
    public setCurrentInstruction(e:Executable):void {this.current_instruction = e;}

    // PRINT
    public static print():void {
        const mem = Memory.get();
        console.log("Memory :", mem.callStack)
    }
}

