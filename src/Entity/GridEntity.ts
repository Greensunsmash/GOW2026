import { Animation, AnimationGroup, CubicEase, EasingFunction, Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { Level } from "../Environment/Level";
import type { MobIntention } from "../MainLoop/ExecutionContext";

export abstract class GridEntity {
    protected readonly initPos : GridPoint;
    protected readonly initRotation : number;
    protected mesh : TransformNode;
    protected anims : AnimationGroup[];
    protected idleAnim: AnimationGroup | undefined;

    // Coordonnées 
    protected gridPos : GridPoint;
    protected facingIndex: number = 0;

    protected level : Level;
    protected _isMoving : boolean = false;
    
    public posListeners: ((pos: GridPoint) => void)[] = [];

    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint) {
        this.level = level;
        //this.logicalGridPos = gridPos;
        this.gridPos = gridPos;
        this.initPos = gridPos;
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        this.mesh = drh.createSingleInstance(assetName, pos);
        this.anims = drh.getAnimations(assetName);
        this.initRotation = this.facingIndex;
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);

        this.idleAnim = this.anims.find(anim => anim.name === "idle");
        if (this.idleAnim)
            this.idleAnim.play(true);
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

    // Déplacements/rotations instantannées
    public moveForward() {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        this.tryMove(facing.x, facing.z);
    }

    public getNextPosIntention(direction?: "forward" | "backward"){
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        let toAdd;
        if (direction === "forward")
            toAdd = {x: facing.x, y:0, z: facing.z};
        else if (direction === "backward")
            toAdd = {x: -facing.x, y:0, z: -facing.z};
        else
            toAdd = {x: 0, y: 0, z:0};
        return GridUtils.add(this.gridPos, toAdd);
    }

    public moveBackward() {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        this.tryMove(-facing.x, -facing.z);
    }

    public turnRight() {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.facingIndex = (this.facingIndex + 1) % 4;
        this.rotation(Math.PI / 2);
    }

    public turnLeft() {
        if (this._isMoving) return;
        this.facingIndex = (this.facingIndex - 1 + 4) % 4;
        this.rotation(-Math.PI / 2);
    }

    public tryMove(dx:number, dz:number) {
        const targetGridPos = GridUtils.add(
            this.gridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (this.level.isWalkable(targetGridPos)) this.doMove(targetGridPos);
        //else throw new Error("Accident de la route sale chauffard");
    }

    public doMove(targetGridPos : GridPoint) {
        this._isMoving = true;
        this.gridPos = targetGridPos;
        this.mesh.position = GridUtils.toWorld(targetGridPos);
        for (let i = 0; i < this.posListeners.length; i++) this.posListeners[i](targetGridPos);
        this._isMoving = false;
    }

    private rotation(relativeAngle: number){
        this._isMoving = true;
        this.mesh.rotation.y = (this.mesh.rotation.y + relativeAngle) % (2 * Math.PI);
    }

    // Déplacements/rotations VISUELS (animés)

    async visualMoveForward() {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        await this.tryVisualMove(facing.x, facing.z);
    }

    async visualMoveBackward() {
        const facing = GridUtils.DIRECTIONS[this.facingIndex];
        await this.tryVisualMove(-facing.x, -facing.z);
    }

    async visualTurnRight() {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.facingIndex = (this.facingIndex + 1) % 4;
        await this.animateRotation(Math.PI / 2);
    }

    async visualTurnLeft() {
        if (this._isMoving) return;
        this.facingIndex = (this.facingIndex - 1 + 4) % 4;
        await this.animateRotation(-Math.PI / 2);
    }

    protected async tryVisualMove(dx: number, dz: number) {
        const targetGridPos = GridUtils.add(
            this.gridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (this.level.isWalkable(targetGridPos)) await this.doVisualMove(targetGridPos);
        //else throw new Error("Accident de la route sale chauffard");
        // (remplacer par quelque chose de moins explosif mdr)
    }

    public async doVisualMove(targetGridPos : GridPoint): Promise<void> {
        this._isMoving = true;
        this.gridPos = targetGridPos;

        const frameRate = 60;
        const duration = 15; 

        let anim: AnimationGroup | undefined = this.anims.find(anim => anim.name === "walk");
        if (anim)
            anim.play(true);

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
                if (anim)
                    anim.stop();
                if (this.idleAnim)
                    this.idleAnim.play(true);
                console.log("ending dovisualmove");
                resolve();
            }
        ));
    }

    protected async animateRotation(relativeAngle: number): Promise<void> {
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

    public getVisualGridPos(): GridPoint {
        return this.gridPos;
    }

    protected updateVisualPos() {
        this.mesh.position = GridUtils.toWorld(this.gridPos);
        this.mesh.rotation = new Vector3(0, this.facingIndex * Math.PI / 2, 0);
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