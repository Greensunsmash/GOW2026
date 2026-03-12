import { Animation, CubicEase, EasingFunction, Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { Level } from "../Environment/Level";

export class GridEntity {
    protected mesh : TransformNode;
    protected gridPos : GridPoint;
    protected level : Level;
    protected facingIndex: number = 0;
    protected _isMoving : boolean = false;

    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint) {
        this.level = level;
        this.gridPos = gridPos;
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        this.mesh = drh.createSingleInstance(assetName, pos);
        this.mesh.rotation.y = this.facingIndex * (Math.PI / 2);
    }

    async moveForward() {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        await this.tryMove(facing.x, facing.z);
    }

    async moveBackward() {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        await this.tryMove(-facing.x, -facing.z);
    }

    async turnRight() {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.facingIndex = (this.facingIndex + 1) % 4;
        await this.animateRotation(Math.PI / 2);
    }

    async turnLeft() {
        if (this._isMoving) return;
        this.facingIndex = (this.facingIndex - 1 + 4) % 4;
        await this.animateRotation(-Math.PI / 2);
    }

    async tryMove(dx: number, dz: number) {
        const targetGridPos = GridUtils.add(
            this.gridPos,
            {
                x: dx,
                y: 0,
                z: dz
            }
        );

        if (this.level.isWalkable(targetGridPos))
            await this.doMove(targetGridPos);
    }

    private async doMove(targetGridPos : GridPoint): Promise<void> {
        this._isMoving = true;
        this.gridPos = targetGridPos;

        const frameRate = 60;
        const duration = 15; 

        return new Promise ((resolve) => Animation.CreateAndStartAnimation(
            "slide",
            this.mesh,
            "position",
            frameRate,
            duration,
            this.mesh.position, 
            GridUtils.toWorld(targetGridPos), 
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            this.createEasing(), 
            () => {
                this._isMoving = false; 
                resolve();
            }
        ));
    }

    private async animateRotation(relativeAngle: number): Promise<void> {
        this._isMoving = true;
        const targetAngle = this.mesh.rotation.y + relativeAngle;

        return new Promise((resolve) => Animation.CreateAndStartAnimation(
            "rotate",
            this.mesh,
            "rotation.y",
            60,
            15,
            this.mesh.rotation.y,
            targetAngle,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            this.createEasing(),
            () => { 
                this.mesh.rotation.y = this.mesh.rotation.y % (2 * Math.PI);
                this._isMoving = false; 
                resolve();
            }
        ));
    }

    private createEasing(): EasingFunction {
        const ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        return ease;
    }
}