import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";

type StackFrame = {
    funcName: string;
    variables: Map<string, Value>;
};

type Action = ValSetAction | BoolSetAction | DefinedAction | CallAction | EndCallAction;

type ValSetAction = {
    type : "VALSET";
    name: string;
    last_value : Value | undefined; 
    new_value : Value
};
type BoolSetAction = {
    type : "BOOLSET";
    name: string;
    last_value :  boolean | undefined; 
    new_value : boolean
};
type DefinedAction = { // Fonctions prédéfinies (donc inversables)
    type : "INSTRUCTION"
    name : string; 
} 
type CallAction = { // Implique la création d'une frame
    type : "CALL";
    name : string; 
    variables : Map<string, Value>
} 
// Il est possible de récréer la frame au lieu de la stocker, a voir
type EndCallAction = {
    type : "END";
    name : string; 
    frame : StackFrame | undefined
}

export type stepInfo = {
    empty: boolean;
    instName?: string;
}

export class Memory {
    private static instance: Memory;

    private values: Map<String, Value>;
    private booleans: Map<String, boolean>;
    private fonctions: Map<String, Fonction>;

    private callStack: StackFrame[];
    private history: Action[]; // On stocke chaque action qu'on fait pour pouvoir retourner en arrière
    private historyID:number;

    private constructor() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.history = [];
        this.historyID = 0;
    }

    clear() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.history = [];
        this.historyID = 0;
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
                this.history.push({type:"VALSET", name:name, last_value:frame.variables.get(name), new_value : val});
                frame.variables.set(name, val);
            } else {
                this.history.push({type:"VALSET", name:name, last_value:this.values.get(name), new_value : val});
                this.values.set(name, val);
            }
        } else {
            this.history.push({type:"BOOLSET", name:name, last_value:this.booleans.get(name), new_value : val});
            this.booleans.set(name, val);
        }
        //this.historyID += 1;
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
    // Il faut refaire toute la logique concernant les booleens
    public getVariableBoolean(name: string): boolean {return this.booleans.get(name) ?? false;}

    public setFonction(name: string, func: Fonction): void { this.fonctions.set(name, func);}
    public getFonction(name: string): Fonction | undefined { return this.fonctions.get(name);}
    
    public newFonctionCall(name: string, map: Map<string, Value>): void {
        if (this.callStack.length >= 100) throw new Error("stack overflow");
        this.callStack.push({funcName: name, variables: map});
        this.history.push({type:"CALL", name:name, variables:map});
        //this.historyID += 1;
    }
    public endFonction(name: string): void {
        if (this.callStack.length > 0) {
            this.history.push({type:"END", name:name, frame:this.callStack.pop()});
            //this.historyID += 1;
        }
    }

    public instructionCalled(name:string) {
        this.history.push({type:"INSTRUCTION", name:name});
        //this.historyID += 1;
    }
    
    public stepBack() : stepInfo {
        console.log(this.historyID);
        if (this.historyID > 0) {
            this.historyID -= 1;
            switch (this.history[this.historyID].type){
                case "VALSET": {// On remet la variable à sa valeur d'avant / on suppr
                    const action = this.history[this.historyID] as ValSetAction;
                    if (this.callStack.length > 0) {
                        const frame = this.callStack[this.callStack.length - 1];
                        
                        if (!frame.variables.has(action.name)) throw new Error("History Error, la variable " + action.name + " n'existe pas !");
                        if (action.last_value) frame.variables.set(action.name, action.last_value);
                        else frame.variables.delete(action.name);
                    } else {
                        if (!this.values.has(action.name)) throw new Error("History Error, la variable " + action.name + " n'existe pas !");
                        if (action.last_value) this.values.set(action.name, action.last_value);
                        else this.values.delete(action.name);
                    }
                    };
                    break;
                case "BOOLSET": {
                    const action = this.history[this.historyID] as BoolSetAction;
                    if (!this.booleans.has(action.name) ) throw new Error("History Error, la variable " + action.name + " n'existe pas !");
                    if (action.last_value) this.booleans.set(action.name, action.last_value);
                    else this.booleans.delete(action.name);
                    };
                    break;
                case "END":{
                    const action = this.history[this.historyID] as EndCallAction;
                    if (action.frame) this.callStack.push(action.frame);
                    };
                    break;
                case "INSTRUCTION": {
                    const action = this.history[this.historyID] as DefinedAction;
                    return {empty: false, instName: action.name};
                    };
                case "CALL":{
                    const action = this.history[this.historyID] as CallAction;
                    if (this.callStack.length == 0) throw new Error("History Error, il n'y a pas de frame");
                    if (this.callStack[this.callStack.length -1].funcName != action.name) throw new Error("History Error, ce n'est pas la bonne frame");
                    this.callStack.pop();
                    };
                    break;
            }
            return {empty: false};
        }
        return {empty: true};
    }
    public nextStep() : stepInfo {
        if (this.historyID < this.history.length) {
            switch (this.history[this.historyID].type) {
                case "VALSET" : {
                    const action = this.history[this.historyID] as ValSetAction;
                    if (this.callStack.length > 0) {
                        const frame = this.callStack[this.callStack.length - 1];
                        frame.variables.set(action.name, action.new_value);
                    } else this.values.set(action.name, action.new_value);
                    };
                    break;
                case "BOOLSET" : {
                    const action = this.history[this.historyID] as BoolSetAction;
                    this.booleans.set(action.name, action.new_value);
                    };
                    break;
                case "END" : {
                    if (this.callStack.length = 0) throw new Error("History Error, il n'y a pas de frame");
                    this.callStack.pop();
                    };
                    break;
                case "INSTRUCTION" : {
                    const action = this.history[this.historyID] as DefinedAction;
                    this.historyID += 1;
                    return {empty: false, instName: action.name};
                    };
                case "CALL" : {
                    const action = this.history[this.historyID] as CallAction;
                    this.callStack.push({funcName:action.name, variables:action.variables});
                    }
            } 
            
            this.historyID += 1;
            return {empty: false};
        }
        return {empty: true};
    }

    // GETTERS
    public getHistory():Action[] {return this.history;}

    // PRINT
    public static print():void {
        const mem = Memory.get();
        console.log("Memory :", mem.callStack, mem.history, mem.historyID)
    }
}

