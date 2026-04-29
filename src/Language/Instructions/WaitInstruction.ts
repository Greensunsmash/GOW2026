import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Instruction } from "./Instruction";

export class WaitInstruction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute() {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);

        await this.ctx.nextTick(undefined, memory.skip);

        Memory.get().setCurrentInstruction(this);

        memory.setCurrentlyMoving(false);

        if (Memory.get().isPlaying()) this.next();
    }

    async back() {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);
        await this.ctx.prevTick();
        super.back();
        memory.setCurrentlyMoving(false);
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}