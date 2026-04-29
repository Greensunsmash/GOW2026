import { Scene } from "@babylonjs/core";
import type { Level } from "../Environment/Level";
import type { ItemType } from "../Environment/LevelReader";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import type { GridPoint } from "../Shared/GridUtils";
import { GridEntity } from "./GridEntity";

export class MarcoBozo extends GridEntity {
    private speed : number = 0.1;
    private carriedItems: ItemType[] = [];

    private onItemsChange: ((items: ItemType[]) => void) | null = null;

    constructor(drh : AssetLibrary, scene : Scene, level : Level, gridPos : GridPoint) {
        super(drh, "robot", level, gridPos);
    }

    override reinit(): void {
        this.carriedItems = [];
        this.onItemsChange?.(this.carriedItems);
        super.reinit();
    }

    itemHere(): boolean {
        return !!this.level.getItemAt(this.gridPos);
    }

    async pickupItem() {
        const itemAtPos = this.level.getItemAt(this.gridPos);
        itemAtPos?.setDisplay(false);
        const type = itemAtPos?.getType();
        if (type) {
            this.carriedItems.push(type);
            this.onItemsChange?.(this.carriedItems);
        }
        console.log("robot now carries : ", this.carriedItems);
    }

    getCarriedItems(): ItemType[] {
        return this.carriedItems;
    }

    hasItem(it: ItemType) {
        return this.carriedItems.some(i => i === it);
    }

    setOnItemsChange(callback: ((items: ItemType[]) => void) | null) {
        this.onItemsChange = callback;
    }
}