import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Memory } from "../Memory";
import { Instruction } from "./Instruction";

export class PickupInstruction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute() {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);

        this.gameModeAtExecute = memory.getGameMode();
        if (this.gameModeAtExecute === "NORMAL")
            await this.ctx.nextTick(undefined, memory.skip);
        else
            await this.ctx.nextTick(this.ctx.getRobot().getNextPosIntention("forward"), memory.skip);

        await this.ctx.getRobot().pickupItem();
        Memory.get().setCurrentInstruction(this);

        memory.setCurrentlyMoving(false);
    
        if (Memory.get().isPlaying()) this.next();
    }

    async back() {
        const memory = Memory.get();
        memory.setCurrentlyMoving(true);

        if (this.gameModeAtExecute === "PIGMODE") {
            if (memory.skip) this.ctx.getRobot().moveBackward();
            else await this.ctx.getRobot().visualMoveBackward();
        } 
        await this.ctx.prevTick();
        //await this.ctx.getRobot().leaveItem();
        super.back();
        memory.setCurrentlyMoving(false);
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}