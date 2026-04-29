import type { MobIntention } from "../MainLoop/ExecutionContext";
import type { GridPoint } from "../Shared/GridUtils";
import { GridEntity } from "./GridEntity";

export abstract class Mob extends GridEntity {
    protected abstract logicalNextPos: GridPoint;


    public abstract nextTickIntention(): MobIntention;
    public abstract doNextTick(processedIntention: MobIntention): Promise<void>; 
}