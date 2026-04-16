import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Instruction } from "./Instruction";

export class MoveForwardInstuction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute() {
        await this.ctx.getRobot().visualMoveForward();
        Memory.get().instructionCalled("forward");

        if (Memory.get().isPlaying()) this.next();
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}