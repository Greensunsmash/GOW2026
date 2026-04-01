import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";

type StackFrame = {
    funcName: string;
    variables: Map<string, Value>;
};

type Action = {};
type SetAction = Action & {
    name : string;
    last_value : string | number | boolean | null; 
};

type CustomAction = Action & { custom_name : string; } // Implique la création d'une frame
type CallAction = Action & { call_name : string; variables : Map<string, Value>} // Fonctions prédéfinies (donc inversables)
// Il est possible de récréer la frame au lieu de la stocker, a voir
type EndCallACtion = Action & {end_name : string; frame : StackFrame}


export class Memory {
    private static instance: Memory;

    private values: Map<String, Value>;
    private booleans: Map<String, boolean>;
    private fonctions: Map<String, Fonction>;

    private callStack: StackFrame[];
    private history: Action[]; // On stocke chaque action qu'on fait pour pouvoir retourner en arrière

    private constructor() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.history = [];
    }

    clear() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.history = [];
    }

    // Singleton
    public static get(): Memory {
        if (!Memory.instance) {
            Memory.instance = new Memory();
        }
        return Memory.instance;
    }

    public setVariable(name: string, val: Value | boolean): void {
        if (val instanceof Value) {
            if (this.callStack.length > 0) {
                const frame = this.callStack[this.callStack.length - 1];
                if (frame.variables.has(name)) this.history.push({name:name, last_value:frame.variables.get(name)});
                else this.history.push({name:name, last_value:null});
                frame.variables.set(name, val);
            } else {
                if (this.values.has(name)) this.history.push({name:name, last_value:this.values.get(name)});
                else this.history.push({name:name, last_value:null});
                this.values.set(name, val);
            }
        } else {
            if (this.booleans.has(name)) this.history.push({name:name, last_value:this.booleans.get(name)});
            else this.history.push({name:name, last_value:null})
            this.booleans.set(name, val);
        }
    }
    public getVariableValue(name: string): Value {
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            const frame = this.callStack[i];
            if (frame.variables.has(name)) {
                return frame.variables.get(name) ?? new Value("Error");
            }
        }

        return this.values.get(name) ?? new Value(0);
    }
    public getVariableBoolean(name: string): boolean {return this.booleans.get(name) ?? false;}

    public setFonction(name: string, func: Fonction): void { this.fonctions.set(name, func);}
    public getFonction(name: string): Fonction | undefined { return this.fonctions.get(name);}
    
    public newFonctionCall(name: string, map: Map<string, Value>): void {
        if (this.callStack.length >= 100) throw new Error("stack overflow");
        this.callStack.push({funcName: name, variables: map});
        this.history.push({callName: name, variables:map});
    }
    public endFonction(name: string): void {if (this.callStack.length > 0) this.history.push({end: name, frame:this.callStack.pop()});}

    public pushCall(name:string) {this.history.push({custom_name:name});}
    
    // GETTERS
    public getHistory():Action[] {return this.history;}
}

