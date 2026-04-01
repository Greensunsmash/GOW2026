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
        await this.ctx.getRobot().turnRight();
        Memory.get().instructionCalled("right");
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}