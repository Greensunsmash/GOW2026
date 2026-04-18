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

    async execute() {
        const memory = Memory.get();
        if (memory.skip) this.ctx.getRobot().turnLeft();
        else await this.ctx.getRobot().visualTurnLeft();
        memory.setCurrentInstruction(this);

        if (memory.isPlaying()) this.next();
    }
    async back() {
        const memory = Memory.get();
        if (memory.skip) this.ctx.getRobot().turnRight();
        else await this.ctx.getRobot().visualTurnRight();
        super.back();
    }
    onLaunch(_l: Launchable): boolean {
        return true;
    }
}