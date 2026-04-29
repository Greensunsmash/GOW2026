import type { Level } from "../Environment/Level";
import type { MobIntention } from "../MainLoop/ExecutionContext";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import type { GridPoint } from "../Shared/GridUtils";
import { Mob } from "./Mob";

export class Pig extends Mob {
    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint) {
        super(drh, assetName, level, gridPos);
    }

    public override nextTickIntention(): MobIntention {

    }

    public override async doNextTick(processedIntention: MobIntention): Promise<void> {

    }
}