import { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class ItemSensor extends Booleen {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }

    eval(): boolean {
        console.log("item sensor :" + this.ctx.getRobot().itemHere());
        return this.ctx.getRobot().itemHere();
    }

    onLaunch(l: Launchable): boolean {return true;}
}