import { Vector3 } from "@babylonjs/core";
import type { Level } from "../Environment/Level";
import type { MobIntention } from "../MainLoop/ExecutionContext";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { Mob } from "./Mob";

export class Pig extends Mob {

    constructor(drh : AssetLibrary, level : Level, gridPos : GridPoint, facingIndex: number) {
        super(drh, "pig", level, gridPos);
        //console.log("PIG ANIMS", this.anims);
        //(this.mesh as any).animations.find(a => a.name.includes("dance"))?.play(true);
        this.facingIndex = facingIndex;
        this.initRotation = facingIndex;
        this.mesh.rotation = new Vector3(0, facingIndex * Math.PI / 2, 0);
    }

    public override nextTickIntention(): MobIntention {
        if (this.dead) {
            return {
                nextPos: {...this.gridPos},
                status: "FORWARD",
                deadDuringTick: true
            };
        }

        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        return {
            nextPos: {x: facing.x + this.gridPos.x, y: this.gridPos.y, z: facing.z + this.gridPos.z},
            status: "FORWARD",
            deadDuringTick: false
        };
    }

    public override async doNextTick(processedIntention: MobIntention, instant?: boolean): Promise<void> {
        if (this.dead)
            return;

        if (processedIntention.status === "STUCK")
            return;
        if (processedIntention.status === "BOUCING") {
            this.facingIndex = (this.facingIndex + 2) % 4;
            await this.animateRotation(Math.PI);
            return;
        }
        await this.doVisualMove(processedIntention.nextPos);

        if (processedIntention.deadDuringTick) {
            this.die();
            this.mesh.setEnabled(false);
        }
    }

    public die() {
        /* anim */
        this.dead = true;
    }
}