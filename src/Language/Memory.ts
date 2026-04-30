import { TimerState } from "@babylonjs/core";
import type { Executable } from "./Executable";
import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";

export type StackFrame = {
    funcName: string;
    variables: Map<string, Value | Boolean>;
};

export type GameMode = "NORMAL" | "PIGMODE";

// Explication de l'execution d'un programme.
// On appelle playScene.run() qui transforme les blocs visuels en blocs logiques.
// Puis on lance le flag. Chaque bloc à les fonctions next et back, qui servent à se déplacer dans le programme, en appellant les next et back listener
// On peut savoir à tout moment ou en est le programme avec Current_instruction, et programme end signifie la fin de l'execution.
// Si playing est vrai, alors le programme se déroule normalement, sinon les fèches peuvent servir à appeler next et back. Si skip est vrai, il n'y a pas d'anim (utile pour se tp direct à la fin notamment)
// Voilà, le tout n'est pas encore robuste et sécurisé, mais have fun ;) 

// La séparation du stockage des bools et des values n'a plus vrm de sens actuellement, étant donné que c'est mélangé dans une stack

export class Memory {
    private static instance: Memory;

    private values: Map<String, Value>;
    private booleans: Map<String, boolean>;
    private fonctions: Map<String, Fonction>;

    private callStack: StackFrame[];

    private playing = true;
    private current_instruction: Executable | undefined;
    public skip = false;
    public currentlyMoving = false;
    private ran = false;

    private onProgramEnd: (() => void) | undefined = undefined;

    private gameMode: GameMode = "NORMAL";
    private gameModeStack: GameMode[] = [];

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
        this.current_instruction = undefined;
        this.ran = false;
        this.gameMode = "NORMAL";
    }

    // Singleton
    public static get(): Memory {
        if (!Memory.instance) {
            Memory.instance = new Memory();
        }
        return Memory.instance;
    }

    public setVariable(name: string, val: Value | Boolean | null): void { // null a pour effet de supprimer la variable
        if (!val) {
            if (this.callStack.length > 0) {
                const frame = this.callStack[this.callStack.length - 1];
                frame.variables.delete(name);
            } else {
                this.values.delete(name);
            }
        } else {
            if (this.callStack.length > 0) {
                const frame = this.callStack[this.callStack.length - 1];
                if (frame.variables.get(name) instanceof Boolean && val instanceof Value) throw new Error("On mélange pas les bools et les values");
                if (frame.variables.get(name) instanceof Value && val instanceof Boolean) throw new Error("On mélange pas les bools et les values");
                frame.variables.set(name, val);
            } else {
                if (val instanceof Value) this.values.set(name, val);
                else this.booleans.set(name, val);
            }
        }
    }
    public getVariableValue(name: string): Value | null {
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            const frame = this.callStack[i];
            const val = frame.variables.get(name);
            if (val instanceof Value) {
                return val ?? new Value("Error");
            }
        }
        return this.values.get(name) ?? null;
    }

    public getVariableBoolean(name: string): boolean | null {
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            const frame = this.callStack[i];
            const val = frame.variables.get(name);
            if (val instanceof Boolean) {
                return val.valueOf() ?? new Value("Error");
            }
        }
        return this.booleans.get(name) ?? null;
    }

    public setFonction(name: string, func: Fonction): void { this.fonctions.set(name, func); }
    public getFonction(name: string): Fonction | undefined { return this.fonctions.get(name); }

    public newFonctionCall(name: string, map: Map<string, Value>): void {
        if (this.callStack.length >= 100) throw new Error("stack overflow");
        this.callStack.push({ funcName: name, variables: map });
    }
    public endFonction(name: string): StackFrame | null {
        if (this.callStack.length > 0) return this.callStack.pop(); // error askip mais non vu que j'ai verif juste avant
        return null
    }
    public stackComeback(bg: StackFrame): void {
        this.callStack.push(bg);
    }

    public stepBack(): void {
        if (this.currentlyMoving || this.isPlaying()) return;
        this.current_instruction?.back();
        //Memory.print();
    }
    public nextStep(): void {
        if (this.currentlyMoving || this.isPlaying()) return;
        if (!this.ran) this.ran = true;
        if (this.current_instruction) this.current_instruction.next();
        //Memory.print();
    }

    public programEnd(): void {
        this.setPlaying(false);
        if (this.onProgramEnd) this.onProgramEnd();
    }

    // GETTERS / SETTERS
    public isPlaying(): boolean { return this.playing; }
    public setPlaying(bool: boolean): void { this.playing = bool; }
    public resetCurrentInstruction(): void { this.current_instruction = undefined; }
    public setCurrentInstruction(e: Executable): void { this.current_instruction = e; }

    public setCurrentlyMoving(isMoving: boolean) { this.currentlyMoving = isMoving; }

    public getCurrentInstruction() {return this.current_instruction;}

    public setRan() {this.ran = true;}
    public hasRan() {return this.ran;}

    public setOnProgramEnd(onProgramEnd: (() => void) | undefined) {this.onProgramEnd = onProgramEnd;}

    public getGameMode(): GameMode {return this.gameMode;}
    public setGameMode(gm: GameMode) {this.gameMode = gm;}

    public onNextTick() {
        this.gameModeStack.push(this.gameMode);
    }
    public onPrevTick() {
        if (this.gameModeStack.length === 0) {
            console.warn("Cannot load a game mode state when game mode state stack is empty");
            return;
        } else if (this.gameModeStack.length === 1) {
            console.warn("popping GAME (not mob) state, but only initial state in stack, so not removing first");
            this.gameMode = this.gameModeStack[0];
        } else {
            this.gameMode = this.gameModeStack.pop()!;
        }
    }

    // PRINT
    public static print(): void { const mem = Memory.get(); console.log("Memory :", mem.callStack, mem.current_instruction); }
}

