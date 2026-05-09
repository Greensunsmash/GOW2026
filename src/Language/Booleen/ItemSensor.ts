import type { BlocContainer } from "../../Containers/BlocContainer";
import { ExecutionContext } from "../../MainLoop/ExecutionContext";
import type { Launchable } from "../Launchable";
import { Booleen } from "./Booleen";

export class ItemSensor extends Booleen {
    private ctx: ExecutionContext;

    constructor(ctx: ExecutionContext, container:BlocContainer) {
        super();
        this.ctx = ctx;
        this.container = container;
    }

    eval(): boolean {
        console.log("item sensor :" + this.ctx.getRobot().itemHere());
        return this.ctx.getRobot().itemHere();
    }

    onLaunch(l: Launchable): boolean {return true;}
}