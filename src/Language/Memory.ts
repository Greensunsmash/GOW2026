import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";

export class Memory {
    private static instance: Memory;

    private values: Map<string, Value>;
    private booleans: Map<string, boolean>;
    private fonctions: Map<string, Fonction>;
    private memoryFonctions: Map<string, Array<Map<string, Value>>>;

    private constructor() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.memoryFonctions = new Map();
    }

    // Singleton
    public static get(): Memory {
        if (!Memory.instance) {
            Memory.instance = new Memory();
        }
        return Memory.instance;
    }

    // Variables
    public setVariable(name: string, val: Value | boolean): void {
        if (val instanceof Value) {
            this.values.set(name, val);
        } else {
            this.booleans.set(name, val);
        }
    }
    
    public getVariableValue(name: string, funcName?: string): Value {
        if (funcName && this.memoryFonctions.has(funcName)) {
            const stack = this.memoryFonctions.get(funcName)!;
            if (stack.length > 0 && stack[stack.length - 1].has(name)) {
                return stack[stack.length - 1].get(name) ?? new Value(0);
            }
        }
        return this.values.get(name) ?? new Value(0);
    }

    public getVariableBoolean(name: string): boolean {
        return this.booleans.get(name) ?? false;
    }

    // Fonctions
    public setFonction(name: string, func: Fonction): void {
        this.fonctions.set(name, func);
        const args = func.getArgs();
        if (!args) return;
        this.memoryFonctions.set(name, []);
    }

    public getFonction(name: string): Fonction | undefined {
        return this.fonctions.get(name);
    }

    public newFonctionCall(name: string, map: Map<string, Value>): void {
        const stack = this.memoryFonctions.get(name);
        if (stack) {
            stack.push(map);
        }
    }

    public endFonction(name: string): void {
        const stack = this.memoryFonctions.get(name);
        if (stack && stack.length > 0) {
            stack.pop();
        }
    }
}

