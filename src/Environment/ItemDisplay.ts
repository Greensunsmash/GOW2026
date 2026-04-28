import type { TransformNode } from "@babylonjs/core";
import type { Level } from "./Level";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { ItemType } from "./LevelReader";

export class ItemDisplay {
    protected mesh : TransformNode;
    protected level: Level;
    protected gridPos: GridPoint;
    protected type: ItemType;

    constructor(drh : AssetLibrary, level : Level, gridPos : GridPoint, type: ItemType) {
        this.level = level;
        this.gridPos = gridPos;
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        this.mesh = drh.createSingleInstance("pill", pos, false, 1.0);
        this.type = type;
    }

    setDisplay(display: boolean) {
        this.mesh.setEnabled(display);
    }

    getGridPos(): GridPoint {
        return this.gridPos;
    }

    getType(): ItemType {
        return this.type;
    }

    dispose() {
        this.mesh.dispose();
    }
}