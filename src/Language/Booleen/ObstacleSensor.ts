import type { ExecutionContext } from "../../Shared/types";
import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class ObstacleSensor extends Booleen {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    eval(): boolean {
        return this.ctx.robot.obstacleAhead();
    }

    onLaunch(l: Launchable): boolean {return true;}
}