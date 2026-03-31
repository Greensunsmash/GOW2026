import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Instruction } from "./Instruction";

export class MoveForwardInstuction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute(): Promise<void> {
        await this.ctx.getRobot().moveForward();
    }

    onLaunch(_l: Launchable): boolean {
        return true;
    }
}