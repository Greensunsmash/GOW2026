import { TimerState } from "@babylonjs/core";
import type { Executable } from "./Executable";
import type { Fonction } from "./Group/Depart/Fonction";
import { Value } from "./Valeur/Value";
import { InstructionContainer } from "../Containers/InstructionContainer";

export type StackFrame = {
    funcName: string;
    variables: Map<string, Value | Boolean>;
};

export type GameMode = "NORMAL" | "PIGMODE";
export type GameModeStackInfo = {
    gameMode: GameMode;
    ticksSinceLastModeChange: number;
    totalTicks: number;
};

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

    private playing = false;
    private current_instruction: Executable | undefined;
    public skip = false;
    private currentlyMoving = false;
    public wait_reset = false;
    public reset_callback : (() => void);
    private ran = false;
    private ended = false;

    private onProgramEnd: (() => void) | undefined = undefined;
    private onUpdate: (() => void) | undefined = undefined;
    
    private gameMode: GameMode = "NORMAL";
    private gameModeStack: GameModeStackInfo[] = [];

    private constructor() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        
        this.gameMode = "NORMAL";
        this.gameModeStack = [];
    }

    clear() {
        this.values = new Map();
        this.booleans = new Map();
        this.fonctions = new Map();
        this.callStack = [];
        this.current_instruction = undefined;
        this.ran = false;
        this.ended = false;

        this.gameMode = "NORMAL";
        this.gameModeStack = [];
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
        console.log("stepBack called, current:", this.current_instruction, "moving:", this.currentlyMoving, "playing:", this.playing);
        if (this.currentlyMoving || this.isPlaying()) return;
        if (this.current_instruction) this.ended = false;
        this.current_instruction?.back();
        //Memory.print();
        this.onUpdate?.();
    }
    public nextStep(): void {
        if (this.currentlyMoving || this.isPlaying()) return;
        if (!this.ran) this.ran = true;
        if (this.current_instruction) this.current_instruction.next();
        this.onUpdate?.();
        //Memory.print();
    }
    public continue():void {
        if (this.currentlyMoving || !this.ran || !this.current_instruction) return;
        this.setPlaying(true);
        this.current_instruction.next();
        this.onUpdate?.();
    }

    public programEnd(): void {
        this.ended = true;
        this.setPlaying(false);
        if (this.current_instruction) {
            const oldContainer = this.current_instruction.getContainer();
            if (oldContainer instanceof InstructionContainer) oldContainer.setHighlighht(false);
        }
        if (this.onProgramEnd) this.onProgramEnd();
        this.onUpdate?.();
    }


    // GETTERS / SETTERS
    public isPlaying(): boolean { return this.playing; }
    public setPlaying(bool: boolean): void { this.playing = bool; }
    public resetCurrentInstruction(): void { 
        if (this.current_instruction) {
            const oldContainer = this.current_instruction.getContainer();
            if (oldContainer instanceof InstructionContainer) oldContainer.setHighlighht(false);
        }

        /*onsole.trace("resetCurrentInstruction");*/ this.current_instruction = undefined; 
        this.onUpdate?.();
    }
    public setCurrentInstruction(e: Executable): void {
        if (this.current_instruction) {
            const oldContainer = this.current_instruction.getContainer();
            if (oldContainer instanceof InstructionContainer) oldContainer.setHighlighht(false);
        }

        /*console.trace("setCurrentInstruction", e);*/ this.current_instruction = e; 
        const container = this.current_instruction.getContainer();
        if (container instanceof InstructionContainer) container.setHighlighht(true);

        this.onUpdate?.();
    }

    public getCurrentInstruction() {return this.current_instruction;}

    public setRan() {this.ran = true;}
    public hasRan() {return this.ran;}

    public hasEnded() {return this.ended;}

    public triggerUpdate() {this.onUpdate?.();}
    public setOnStateUpdate(onUpdate: (() => void) | undefined) {this.onUpdate = onUpdate;}
    public setOnProgramEnd(onProgramEnd: (() => void) | undefined) {this.onProgramEnd = onProgramEnd;}

    public isCurrentlyMoving():boolean {return this.currentlyMoving;}
    public setCurrentlyMoving(isMoving:boolean) {
        if (this.wait_reset) {this.currentlyMoving = false; this.reset_callback();}
        else this.currentlyMoving = isMoving;
        this.onUpdate?.();
    }
    public getGameMode(): GameMode {return this.gameMode;}
    public setGameMode(gm: GameMode) {this.gameMode = gm;}

    public onNextTick(ticksSinceLastModeChange: number, totalTicks: number) {
        console.log(this.gameModeStack);
        this.gameModeStack.push({gameMode: this.gameMode, ticksSinceLastModeChange, totalTicks});
    }
    public onPrevTick(): GameModeStackInfo | undefined {
        console.log(this.gameModeStack);
        if (this.gameModeStack.length === 0) {
            console.warn("Cannot load a game mode state when game mode state stack is empty");
            return;
        } else {
            const gmStackInfo = this.gameModeStack.pop()!;
            this.gameMode = gmStackInfo.gameMode;
            return gmStackInfo;
        }
    }

    // PRINT
    public static print(): void { const mem = Memory.get(); console.log("Memory :", mem.callStack, mem.current_instruction); }
}

