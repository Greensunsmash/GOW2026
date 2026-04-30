import type { Level } from "../Environment/Level";
import type { ItemType } from "../Environment/LevelReader";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { type GridPoint } from "../Shared/GridUtils";
import { Interactable } from "./Interactable";
import type { MarcoBozo } from "./Robot";

export class ItemDisplay extends Interactable {
    protected type: ItemType;

    constructor(drh : AssetLibrary, level : Level, gridPos : GridPoint, type: ItemType) {
        super(drh, "pill", level, gridPos);
        this.type = type;
    }

    override async onInteract(robot: MarcoBozo): Promise<void> {
        return;
    }

    getType(): ItemType {
        return this.type;
    }
}
