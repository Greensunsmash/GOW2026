import { Vector3 } from "@babylonjs/core";
import type { Level } from "../Environment/Level";
import type { MobIntention } from "../MainLoop/ExecutionContext";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { Mob } from "./Mob";

export class Circe extends Mob {

    constructor(drh : AssetLibrary, level : Level, gridPos : GridPoint, facingIndex: number) {
        super(drh, "circe", level, gridPos);
        console.log("creating a circé !");
        //(this.mesh as any).animations.find(a => a.name.includes("dance"))?.play(true);
        this.facingIndex = facingIndex;
        this.initRotation = facingIndex;
        this.mesh.rotation = new Vector3(0, facingIndex * Math.PI / 2, 0);
    }

    public override nextTickIntention(): MobIntention {
        return {
            nextPos: {x: this.gridPos.x, y: this.gridPos.y, z:this.gridPos.z},
            status: "STUCK",
            deadDuringTick: false
        };
    }

    public override async doNextTick(processedIntention: MobIntention, instant?: boolean): Promise<void> {
        return;
    }

    public die() {
    }
}