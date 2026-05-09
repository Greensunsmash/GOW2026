import type { BlocContainer } from "../../Containers/BlocContainer";
import  { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class ObstacleSensor extends Booleen {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext, container:BlocContainer) {
        super();
        this.ctx = ctx;
        this.container = container;
    }

    eval(): boolean {
        return !this.ctx.getRobot().obstacleAhead();
    }

    onLaunch(l: Launchable): boolean {return true;}
}