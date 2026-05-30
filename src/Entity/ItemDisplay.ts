import type { Level } from "../Environment/Level";
import type { ItemType } from "../Environment/LevelReader";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { type GridPoint } from "../Shared/GridUtils";
import { Interactable } from "./Interactable";
import type { MarcoBozo } from "./Robot";

export class ItemDisplay extends Interactable {
    protected type: ItemType;

    constructor(drh : AssetLibrary, level : Level, worldNo: number, gridPos : GridPoint, type: ItemType) {
        const debris = [["debris1", 0.35], ["debris1", 0.35]];
        super(drh, debris[worldNo-1][0], level, gridPos, false, debris[worldNo-1][1]);
        this.type = type;
        this.mesh.position.y -= 0.1;
    }

    override async onInteract(robot: MarcoBozo): Promise<void> {
        return;
    }



    getType(): ItemType {
        return this.type;
    }
}
