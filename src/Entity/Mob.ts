import { ThinSSAO2BlurPostProcess } from "@babylonjs/core/PostProcesses/thinSSAO2BlurPostProcess";
import type { MobIntention } from "../MainLoop/ExecutionContext";
import type { GridPoint, GridUtils } from "../Shared/GridUtils";
import { GridEntity } from "./GridEntity";

export type MobState = {
    pos: GridPoint;
    facingIndex: number;
    dead: boolean;
}

export abstract class Mob extends GridEntity {
    protected dead: boolean = false;

    public getState(): MobState {
        return {pos: {...this.gridPos}, facingIndex: this.facingIndex, dead: this.dead};
    }

    public setState(state: MobState) {
        this.gridPos = state.pos;
        this.facingIndex = state.facingIndex;
        this.dead = state.dead;
        if (!this.dead)
            this.mesh.setEnabled(true);
        this.updateVisualPos();
    }

    override reinit() {
        this.dead = false;
        this.mesh.setEnabled(true);
        super.reinit();
    }
    
    public abstract nextTickIntention(): MobIntention;
    public abstract doNextTick(processedIntention: MobIntention, instant?: boolean): Promise<void>; 
}