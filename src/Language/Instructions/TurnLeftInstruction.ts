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
        Memory.get().setCurrentInstruction(this);

        if (Memory.get().isPlaying()) this.next();
    }
    async back() {
        await this.ctx.getRobot().visualTurnRight();
        super.back();
    }
    onLaunch(_l: Launchable): boolean {
        return true;
    }
}