import type { ExecutionContext } from "../../Shared/types";
import type { Launchable } from "../Launchable";
import { Instruction } from "./Instruction";

export class MoveBackwardInstuction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute(): Promise<void> {
        await this.ctx.getRobot().moveBackward();
    }

    onLaunch(l: Launchable): boolean {
        return true;
    }
}