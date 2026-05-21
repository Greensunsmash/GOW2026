import { Scene, TransformNode } from "@babylonjs/core";
import type { Level } from "../Environment/Level";
import type { ItemType } from "../Environment/LevelReader";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { GridEntity, type EntityState } from "./GridEntity";

export class MarcoBozo extends GridEntity {
    private speed : number = 0.1;
    private carriedItems: ItemType[] = [];
    private affectedByADivineCurse: boolean = false;
    private readonly pigMesh: TransformNode;
    private readonly origMesh: TransformNode;

    private onItemsChange: ((items: ItemType[]) => void) | null = null;

    constructor(drh : AssetLibrary, scene : Scene, level : Level, gridPos : GridPoint) {
        super(drh, "robot", level, gridPos);
        this.origMesh = this.mesh;
        this.pigMesh = drh.createSingleInstance("pig", GridUtils.toWorld(gridPos));
        this.pigMesh.rotation.y = this.initRotation * (Math.PI / 2);
        this.pigMesh.setEnabled(false);
    }

    override reinit(): void {
        this.carriedItems = [];
        this.backToACuteLittleRobot();
        this.onItemsChange?.([]);
        super.reinit();
    }

    itemHere(): boolean {
        return !!this.level.getItemAt(this.gridPos);
    }

    async pickupItem() {
        const itemAtPos = this.level.getItemAt(this.gridPos);
        if (!itemAtPos) {
            // faire un truc
        }
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

    override getState(): EntityState {
        return {
            carriedItems: [...this.carriedItems],
            affectedByADivineCurse: this.affectedByADivineCurse,
            pos: {...this.gridPos}, 
            facingIndex: this.facingIndex, 
           //dead: this.dead
        };
    }

    override setState(state: EntityState, instant?: boolean) {
        this.carriedItems = state.carriedItems!;
        this.onItemsChange?.(this.carriedItems);
        if (this.affectedByADivineCurse != state.affectedByADivineCurse) {
            if (state.affectedByADivineCurse) {
                this.turnToAPig();
            } else {
                this.backToACuteLittleRobot();
            }
        }
        this.gridPos = state.pos!;
        this.facingIndex = state.facingIndex!;
        this.updateVisualPos(instant);
    }

    setOnItemsChange(callback: ((items: ItemType[]) => void) | null) {
        this.onItemsChange = callback;
    }

    public turnToAPig() {
        console.log("entering turntoapig");
        this.affectedByADivineCurse = true;
        this.origMesh.setEnabled(false);
        this.pigMesh.position = this.origMesh.position;
        this.pigMesh.rotation = this.origMesh.rotation;
        this.pigMesh.setEnabled(true);
        this.mesh = this.pigMesh;
        (this.mesh as any).animations?.find(anim => anim.name.includes("idle"))?.play(true);
    }

    public backToACuteLittleRobot() {
        console.log("entering backtocutelittlerobotohsocuteawww");
        this.affectedByADivineCurse = false;
        this.pigMesh.setEnabled(false);
        this.origMesh.position = this.pigMesh.position;
        this.origMesh.rotation = this.origMesh.rotation;
        this.origMesh.setEnabled(true);
        this.mesh = this.origMesh;
        (this.mesh as any).animations?.find(anim => anim.name.includes("idle"))?.play(true);
    }
}