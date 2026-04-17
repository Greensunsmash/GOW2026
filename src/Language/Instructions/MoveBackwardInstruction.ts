import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Instruction } from "./Instruction";

export class MoveBackwardInstuction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute() {
        await this.ctx.getRobot().visualMoveBackward();
        Memory.get().setCurrentInstruction(this);

        if (Memory.get().isPlaying()) this.next();
    }

    async back() {
        await this.ctx.getRobot().visualMoveForward();
        super.back();
    }
    onLaunch(_l: Launchable): boolean {
        return true;
    }
}