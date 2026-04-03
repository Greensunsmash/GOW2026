import { Animation, CubicEase, EasingFunction, Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { Level } from "../Environment/Level";

export class GridEntity {
    protected readonly initPos : GridPoint;
    protected readonly initRotation : number;
    protected mesh : TransformNode;
    protected gridPos : GridPoint;
    protected level : Level;
    protected facingIndex: number = 0;
    protected _isMoving : boolean = false;
    
    public posListeners: ((pos: GridPoint) => void)[] = [];

    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint) {
        this.level = level;
        this.gridPos = gridPos;
        this.initPos = gridPos;
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        this.mesh = drh.createSingleInstance(assetName, pos);
        this.initRotation = this.facingIndex;
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);
    }

    async moveForward(force : boolean = false) {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        await this.tryMove(facing.x, facing.z, force);
    }

    async moveBackward(force : boolean = false) {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        await this.tryMove(-facing.x, -facing.z, force);
    }

    async turnRight(force : boolean = false) {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.facingIndex = (this.facingIndex + 1) % 4;
        if (force) this.forceRotation(Math.PI / 2);
        else await this.animateRotation(Math.PI / 2);
    }

    async turnLeft(force : boolean = false) {
        if (this._isMoving) return;
        this.facingIndex = (this.facingIndex - 1 + 4) % 4;
        if (force) this.forceRotation(-Math.PI);
        else await this.animateRotation(-Math.PI / 2);
    }

    public obstacleAhead(): boolean {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        const targetGridPos = GridUtils.add(
            this.gridPos,
            {
                x: facing.x,
                y: 0,
                z: facing.z
            }
        );
        return !this.level.isWalkable(targetGridPos);
    }

    protected async tryMove(dx: number, dz: number, force : boolean = false) {
        const targetGridPos = GridUtils.add(
            this.gridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (force) {
            if (this.level.isWalkable(targetGridPos)) this.forceMove(targetGridPos);
            else throw new Error("Error: Attempted to force a crash into the wall");
        } else if (this.level.isWalkable(targetGridPos)) await this.doMove(targetGridPos);
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
                for (let i = 0; i < this.posListeners.length; i++) {
                    this.posListeners[i](targetGridPos);
                }
                resolve();
            }
        ));
    }

    private forceMove(targetGridPos : GridPoint) : void {
        this.gridPos = targetGridPos;
        this.mesh.position = GridUtils.toWorld(targetGridPos);
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

    private forceRotation(relativeAngle: number): void {
        this.mesh.rotation.y = this.mesh.rotation.y + relativeAngle;
    }

    private createEasing(): EasingFunction {
        const ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        return ease;
    }

    public getGridPos(): GridPoint {
        return this.gridPos;
    }

    public reinit() {
        this.mesh.position = GridUtils.toWorld(this.initPos);
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);
        this.facingIndex = this.initRotation;
        this.gridPos = this.initPos;
    }

    public dispose() {
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null as any;
        }
        this.level = null as any;
        this.gridPos = null as any;
        this._isMoving = false;
    }
}