import type { MobIntention } from "../MainLoop/ExecutionContext";
import { GridEntity, type EntityState } from "./GridEntity";

export abstract class Mob extends GridEntity {
    protected dead: boolean = false;

    public override getState(): EntityState {
        return {
            pos: {...this.gridPos}, 
            facingIndex: this.facingIndex, 
            dead: this.dead
        };
    }

    public override setState(state: EntityState) {
        this.gridPos = state.pos!;
        this.facingIndex = state.facingIndex!;
        this.dead = state.dead!;
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