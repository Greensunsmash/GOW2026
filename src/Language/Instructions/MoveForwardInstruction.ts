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
        console.log("forward");
        await this.ctx.getRobot().visualMoveForward();
        Memory.get().setCurrentInstruction(this);

        if (Memory.get().isPlaying()) this.next();
    }

    async back() {
        console.log("reverseForward");
        await this.ctx.getRobot().visualMoveBackward();
        super.back();
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}