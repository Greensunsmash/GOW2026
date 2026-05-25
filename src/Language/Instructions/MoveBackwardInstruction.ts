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
        const memory = Memory.get();

        // se deplace
        memory.setCurrentlyMoving(true);

        this.gameModeAtExecute = memory.getGameMode();
        await this.ctx.nextTick(this.ctx.getRobot().getNextPosIntention(
            Memory.get().getGameMode() === "PIGMODE" ? "forward": "backward"
        ), memory.skip);
        /*if (memory.skip) this.ctx.getRobot().moveBackward();
        else await this.ctx.getRobot().visualMoveBackward();*/
        memory.setCurrentInstruction(this);

        // stop le deplacement
        memory.setCurrentlyMoving(false);

        if (memory.isPlaying()) this.next();
    }

    async back() {
        const memory = Memory.get();

        memory.setCurrentlyMoving(true);


        if (this.gameModeAtExecute === "PIGMODE") {
            if (memory.skip) this.ctx.getRobot().moveBackward();
            else await this.ctx.getRobot().visualMoveBackward();
        } else {
            if (memory.skip) this.ctx.getRobot().moveForward();
            else await this.ctx.getRobot().visualMoveForward();
        }
        
        await this.ctx.prevTick(memory.skip /* instant */);
        super.back();

        memory.setCurrentlyMoving(false);
    }
    onLaunch(_l: Launchable): boolean {
        return true;
    }
}