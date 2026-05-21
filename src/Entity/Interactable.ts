// classe qui décrit les "objets" (caisses, oeil de sir c)
// c à dire tout sauf mob & robot quoi

import type { Level } from "../Environment/Level";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { type GridPoint } from "../Shared/GridUtils";
import { GridEntity, type EntityState } from "./GridEntity";
import type { MarcoBozo } from "./Robot";

export abstract class Interactable extends GridEntity {

    constructor(drh : AssetLibrary, assetName: string, level : Level, gridPos : GridPoint) {
        super(drh, assetName, level, gridPos, false);
    }

    setDisplay(display: boolean) {
        this.mesh.setEnabled(display);
    }

    abstract onInteract(entity: GridEntity): Promise<void>;

    override getState(): EntityState {
        return {
            pos: {...this.gridPos},
            facingIndex: this.facingIndex,
            displayed: this.mesh.isEnabled()
        };
    }

    override async setState(state: EntityState, instant?: boolean) {
        this.gridPos = {...state.pos!};
        this.facingIndex = state.facingIndex!;
        this.mesh.setEnabled(state.displayed!);
        await this.updateVisualPos(instant);
    }
}