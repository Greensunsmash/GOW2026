import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Instruction } from "./Instruction";

export class TurnLeftInstruction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute(): Promise<void> {
        await this.ctx.getRobot().visualTurnLeft();
        Memory.get().instructionCalled("left");

        if (Memory.get().isPlaying()) this.next();
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}