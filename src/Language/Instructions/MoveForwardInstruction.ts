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
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);

        await this.ctx.nextTick(this.ctx.getRobot().getNextPosIntention("forward"), memory.skip);
        
        /*if (memory.skip) this.ctx.getRobot().moveForward();
        else await this.ctx.getRobot().visualMoveForward();*/
        Memory.get().setCurrentInstruction(this);

        memory.setCurrentlyMoving(false);

        console.log("isPlaying:", Memory.get().isPlaying(), "currentlyMoving:", memory.currentlyMoving);
        if (Memory.get().isPlaying()) this.next();
        else console.log("STOPPED HERE");
    }

    async back() {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);
        await this.ctx.prevTick();
        if (memory.skip) this.ctx.getRobot().moveBackward();
        else await this.ctx.getRobot().visualMoveBackward();
        super.back();
        memory.setCurrentlyMoving(false);
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}