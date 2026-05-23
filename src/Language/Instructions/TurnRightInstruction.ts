import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Instruction } from "./Instruction";

export class TurnRightInstruction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute(): Promise<void> {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);

        if (Memory.get().getGameMode() === "PIGMODE") {
            await this.ctx.nextTick(this.ctx.getRobot().getNextPosIntention("forward"), memory.skip);
        } else {
            if (memory.skip) this.ctx.getRobot().turnRight();
            else await this.ctx.getRobot().visualTurnRight();
        }
        await this.ctx.nextTick(undefined, memory.skip);
        memory.setCurrentInstruction(this);
        memory.setCurrentlyMoving(false);

        if (memory.isPlaying()) this.next();
    }

    async back() {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);
        await this.ctx.prevTick(memory.skip /* instant */);
        if (Memory.get().getGameMode() === "PIGMODE") {
            if (memory.skip) this.ctx.getRobot().moveBackward();
            else await this.ctx.getRobot().visualMoveBackward();
        } else {
            if (memory.skip) this.ctx.getRobot().turnLeft();
            else await this.ctx.getRobot().visualTurnLeft();
        }
        super.back();
        
        memory.setCurrentlyMoving(false);
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}