import { Animation, CubicEase, EasingFunction, Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { Level } from "../Environment/Level";

export class GridEntity {
    protected readonly initPos : GridPoint;
    protected readonly initRotation : number;
    protected mesh : TransformNode;

    // Coordonnées logiques (compilation)
    protected logicalGridPos: GridPoint;
    protected logicalFacingIndex: number = 0;

    // Coordonnées visuelles (exécution de la trace que y a dans Memory)
    protected visualGridPos : GridPoint;
    protected visualFacingIndex: number = 0;

    protected level : Level;
    protected _isMoving : boolean = false;
    
    public posListeners: ((pos: GridPoint) => void)[] = [];

    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint) {
        this.level = level;
        this.logicalGridPos = gridPos;
        this.visualGridPos = gridPos;
        this.initPos = gridPos;
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        this.mesh = drh.createSingleInstance(assetName, pos);
        this.initRotation = this.visualFacingIndex;
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);
    }

    // Fonctions LOGIQUES (utiles pour la compilation)

    public logicalMoveForward() {
        const facing = GridUtils.DIRECTIONS[this.logicalFacingIndex];
        this.tryLogicalMove(facing.x, facing.z);
    }

    public logicalMoveBackward() {
        const facing = GridUtils.DIRECTIONS[this.logicalFacingIndex];
        this.tryLogicalMove(-facing.x, -facing.z);
    }

    protected tryLogicalMove(dx: number, dz: number) {
        const targetGridPos = GridUtils.add(
            this.logicalGridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (this.level.isWalkable(targetGridPos)) 
            this.logicalGridPos = targetGridPos;
    }

    public logicalTurnRight() {
        // 0 -> 1 -> 2 -> 3 -> 0
        this.logicalFacingIndex = (this.logicalFacingIndex + 1) % 4;
    }

    public logicalTurnLeft() {
        this.logicalFacingIndex = (this.logicalFacingIndex - 1 + 4) % 4;
    }

    public obstacleAhead(): boolean {
        const facing = GridUtils.DIRECTIONS[this.logicalFacingIndex];
        const targetGridPos = GridUtils.add(
            this.logicalGridPos,
            {
                x: facing.x,
                y: 0,
                z: facing.z
            }
        );
        return !this.level.isWalkable(targetGridPos);
    }

    // Déplacements/rotations VISUELS

    async visualMoveForward(force : boolean = false) {
        const facing = GridUtils.DIRECTIONS[this.visualFacingIndex];
        await this.tryVisualMove(facing.x, facing.z, force);
    }

    async visualMoveBackward(force : boolean = false) {
        const facing = GridUtils.DIRECTIONS[this.visualFacingIndex];
        await this.tryVisualMove(-facing.x, -facing.z, force);
    }

    async visualTurnRight(force : boolean = false) {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.visualFacingIndex = (this.visualFacingIndex + 1) % 4;
        if (force) this.forceRotation(Math.PI / 2);
        else await this.animateRotation(Math.PI / 2);
    }

    async visualTurnLeft(force : boolean = false) {
        if (this._isMoving) return;
        this.visualFacingIndex = (this.visualFacingIndex - 1 + 4) % 4;
        if (force) this.forceRotation(-Math.PI);
        else await this.animateRotation(-Math.PI / 2);
    }

    protected async tryVisualMove(dx: number, dz: number, force : boolean = false) {
        const targetGridPos = GridUtils.add(
            this.visualGridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (force) {
            if (this.level.isWalkable(targetGridPos)) this.forceMove(targetGridPos);
            else throw new Error("Error: Attempted to force a crash into the wall");
        } else if (this.level.isWalkable(targetGridPos)) await this.doVisualMove(targetGridPos);
    }

    private async doVisualMove(targetGridPos : GridPoint): Promise<void> {
        this._isMoving = true;
        this.visualGridPos = targetGridPos;

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
        this.visualGridPos = targetGridPos;
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

    public getVisualGridPos(): GridPoint {
        return this.visualGridPos;
    }

    public reinit() {
        this.mesh.position = GridUtils.toWorld(this.initPos);
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);
        this.visualFacingIndex = this.initRotation;
        this.visualGridPos = this.initPos;
        this.logicalFacingIndex = this.initRotation;
        this.logicalGridPos = this.initPos;
    }

    public dispose() {
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null as any;
        }
        this.level = null as any;
        this.visualGridPos = null as any;
        this._isMoving = false;
    }
}