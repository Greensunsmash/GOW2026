import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";

type StackFrame = {
    funcName: string;
    variables: Map<string, Value>;
};

export class Memory {
    private static instance: Memory;

    private values: Map<String, Value>;
    private booleans: Map<String, boolean>;
    private fonctions: Map<String, Fonction>;

    private callStack: StackFrame[];

    private constructor() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
    }

    clear() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
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
                frame.variables.set(name, val);
            } else {
                this.values.set(name, val);
            }
        } else {
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

    public getVariableBoolean(name: string): boolean {
        return this.booleans.get(name) ?? false;
    }

    public setFonction(name: string, func: Fonction): void {
        this.fonctions.set(name, func);
    }

    public getFonction(name: string): Fonction | undefined {
        return this.fonctions.get(name);
    }

    public newFonctionCall(name: string, map: Map<string, Value>): void {
        if (this.callStack.length >= 100) throw new Error("stack overflow");
        this.callStack.push({
            funcName: name,
            variables: map
        });
    }

    public endFonction(name: string): void {
        // Pop du dernier frame (pas besoin du nom ici)
        if (this.callStack.length > 0) {
            this.callStack.pop();
        }
    }
}

