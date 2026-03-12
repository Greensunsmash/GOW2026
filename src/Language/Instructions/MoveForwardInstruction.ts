import type { ExecutionContext } from "../../Shared/types";
import type { Launchable } from "../Launchable";
import { Instruction } from "./Instruction";

export class MoveForwardInstuction extends Instruction {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    async execute(): Promise<void> {
        await this.ctx.robot.moveForward();
    }

    onLaunch(l: Launchable): boolean {
        if (l)
            console.log("A LAUNCHABLE HAS BEEN TRANSMITTED. JAVASCRIPT IS WORKING.")
        return true;
    }
}