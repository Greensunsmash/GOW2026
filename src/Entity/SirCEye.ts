import type { Level } from "../Environment/Level";
import type { ItemType } from "../Environment/LevelReader";
import { Memory } from "../Language/Memory";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import type { GridPoint } from "../Shared/GridUtils";
import type { GridEntity } from "./GridEntity";
import { Interactable } from "./Interactable";
import { MarcoBozo } from "./Robot";

export class SirCEye extends Interactable {
    constructor(drh : AssetLibrary, level : Level, gridPos : GridPoint) {
        super(drh, "debris1", level, gridPos);
        this.mesh.setEnabled(false);
    }

    override async onInteract(entity: GridEntity) {
        console.log("entering sirceye oninteract");
        // une entité est sur un oeil de sir c, est ce le robot ?
        if (!(entity instanceof MarcoBozo))
            return;
        // c'est le robot ! c parti pour le mode cochon
        Memory.get().setGameMode("PIGMODE");
        entity.turnToAPig();
    }

    override reinit() {
        super.reinit();
        this.setDisplay(false);
    }
}