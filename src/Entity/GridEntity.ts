import { Animation, AnimationGroup, CubicEase, EasingFunction, Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { Level } from "../Environment/Level";

export class GridEntity {
    protected readonly initPos : GridPoint;
    protected readonly initRotation : number;
    protected mesh : TransformNode;
    protected anims : AnimationGroup[];
    protected idleAnim: AnimationGroup | undefined;

    // Coordonnées logiques (compilation)
    /*
    protected logicalGridPos: GridPoint;
    protected logicalFacingIndex: number = 0; */

    // Coordonnées visuelles (exécution de la trace que y a dans Memory)
    protected visualGridPos : GridPoint;
    protected visualFacingIndex: number = 0;

    protected level : Level;
    protected _isMoving : boolean = false;
    
    public posListeners: ((pos: GridPoint) => void)[] = [];

    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint) {
        this.level = level;
        //this.logicalGridPos = gridPos;
        this.visualGridPos = gridPos;
        this.initPos = gridPos;
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        this.mesh = drh.createSingleInstance(assetName, pos);
        this.anims = drh.getAnimations(assetName);
        this.initRotation = this.visualFacingIndex;
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);

        this.idleAnim = this.anims.find(anim => anim.name === "idle");
        if (this.idleAnim)
            this.idleAnim.play(true);
    }

    // Fonctions LOGIQUES (utiles pour la compilation)
/*
    public logicalMoveForward() {
        const facing = GridUtils.DIRECTIONS[this.logicalFacingIndex];
        this.tryLogicalMove(facing.x, facing.z);
    }

    public logicalMoveBackward() {
        console.log("hey");
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
    }*/

    // Déplacements/rotations instantannées
    public moveForward() {
        const facing = GridUtils.DIRECTIONS[this.visualFacingIndex];
        this.tryMove(facing.x, facing.z);
    }

    public moveBackward() {
        const facing = GridUtils.DIRECTIONS[this.visualFacingIndex];
        this.tryMove(-facing.x, -facing.z);
    }

    public turnRight() {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.visualFacingIndex = (this.visualFacingIndex + 1) % 4;
        this.rotation(Math.PI / 2);
    }

    public turnLeft() {
        if (this._isMoving) return;
        this.visualFacingIndex = (this.visualFacingIndex - 1 + 4) % 4;
        this.rotation(-Math.PI / 2);
    }

    protected tryMove(dx:number, dz:number) {
        const targetGridPos = GridUtils.add(
            this.visualGridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (this.level.isWalkable(targetGridPos)) this.doMove(targetGridPos);
        else throw new Error("Accident de la route sale chauffard");
    }

    private doMove(targetGridPos : GridPoint) {
        this._isMoving = true;
        this.visualGridPos = targetGridPos;
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
        const facing = GridUtils.DIRECTIONS[this.visualFacingIndex];
        await this.tryVisualMove(facing.x, facing.z);
    }

    async visualMoveBackward() {
        const facing = GridUtils.DIRECTIONS[this.visualFacingIndex];
        await this.tryVisualMove(-facing.x, -facing.z);
    }

    async visualTurnRight() {
        if (this._isMoving) return;
        // 0 -> 1 -> 2 -> 3 -> 0
        this.visualFacingIndex = (this.visualFacingIndex + 1) % 4;
        await this.animateRotation(Math.PI / 2);
    }

    async visualTurnLeft() {
        if (this._isMoving) return;
        this.visualFacingIndex = (this.visualFacingIndex - 1 + 4) % 4;
        await this.animateRotation(-Math.PI / 2);
    }

    protected async tryVisualMove(dx: number, dz: number) {
        const targetGridPos = GridUtils.add(
            this.visualGridPos,  
            {               // je me battrais jusqu'à la mort
                x: dx,      
                y: 0, 
                z: dz
            }
        );

        if (this.level.isWalkable(targetGridPos)) await this.doVisualMove(targetGridPos);
        else throw new Error("Accident de la route sale chauffard");
    }

    private async doVisualMove(targetGridPos : GridPoint): Promise<void> {
        this._isMoving = true;
        this.visualGridPos = targetGridPos;

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

    public getVisualGridPos(): GridPoint {
        return this.visualGridPos;
    }

    public reinit() {
        this.mesh.position = GridUtils.toWorld(this.initPos);
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);
        this.visualFacingIndex = this.initRotation;
        this.visualGridPos = this.initPos;
        //this.logicalFacingIndex = this.initRotation;
        //this.logicalGridPos = this.initPos;
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