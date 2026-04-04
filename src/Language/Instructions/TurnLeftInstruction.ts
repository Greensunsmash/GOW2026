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

    async execute(): Promise<void> {
        this.ctx.getRobot().logicalTurnLeft();
        Memory.get().instructionCalled("left");
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}