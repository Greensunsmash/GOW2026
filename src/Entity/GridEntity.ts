import { Animation, AnimationGroup, CubicEase, EasingFunction, Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { Level } from "../Environment/Level";
import type { ItemType } from "../Environment/LevelReader";
import type { MarcoBozo } from "./Robot";
import { SoundManager } from "../Shared/Sounds";

export type EntityState = {
    pos?: GridPoint;
    facingIndex?: number;
    displayed?: boolean;
    dead?: boolean;
    carriedItems?: ItemType[];
    affectedByADivineCurse?: boolean;
}

export abstract class GridEntity {
    protected initPos : GridPoint;
    protected initRotation : number;
    protected mesh : TransformNode;
    protected anims : AnimationGroup[];
    protected idleAnim: AnimationGroup | undefined;

    // Coordonnées 
    protected gridPos : GridPoint;
    protected facingIndex: number = 0;

    protected level : Level;
    protected _isMoving : boolean = false;
    
    public posListeners: ((entity: GridEntity) => Promise<void>)[] = [];

    constructor(drh : AssetLibrary, assetName : string, level : Level, gridPos : GridPoint, scale: boolean = true, scaleF = 1.0) {
        this.level = level;
        //this.logicalGridPos = gridPos;
        this.gridPos = {...gridPos};
        this.initPos = {...gridPos};
        const pos : Vector3 = GridUtils.toWorld(gridPos);
        if (scale)
            this.mesh = drh.createSingleInstance(assetName, pos);
        else
            this.mesh = drh.createSingleInstance(assetName, pos, false, scaleF);
        this.anims = (this.mesh as any).animations;
        this.initRotation = this.facingIndex;
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);

        (this.mesh as any).animations?.find(anim => anim.name.includes("idle"))?.play(true);
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
        return (
            this.level.isObstacle(targetGridPos)
            || this.level.getMobsAt(targetGridPos).length >= 1
        ); // ????????, justifie ça tout de suite
        // personne ne saura jamais pk t'as écrit ca
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
        //console.log("in turnLeft");
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

    public doMove(targetGridPos : GridPoint, bounce?: boolean) {
        this._isMoving = true;
        this.gridPos = {...targetGridPos};
        this.mesh.position = GridUtils.toWorld(targetGridPos);
        if (bounce) {
            this.facingIndex = (this.facingIndex + 2) % 4;
            this.rotation(Math.PI);
        }
        //for (let i = 0; i < this.posListeners.length; i++) this.posListeners[i](this);
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
        await this.animateRotation(Math.PI / 2, "rotationRobot");
    }

    async visualTurnLeft() {
        if (this._isMoving) return;
        this.facingIndex = (this.facingIndex - 1 + 4) % 4;
        await this.animateRotation(-Math.PI / 2, "rotationRobot");
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

    public async doVisualMove(targetGridPos : GridPoint, bounce?: boolean, sound?:string): Promise<void> {
        //console.trace("dovisualmove: ");

        if (bounce) {
            this.facingIndex = (this.facingIndex + 2) % 4;
            await this.animateRotation(Math.PI);
        }

        this._isMoving = true;
        this.gridPos = {...targetGridPos};

        const frameRate = 60;
        const duration = 15; 

        const anim = (this.mesh as any).animations?.find(anim => anim.name.includes("walk"));
        anim?.play(true);


        if (sound) SoundManager.playSound(sound);
        return new Promise ((resolve) => Animation.CreateAndStartAnimation(
            "slide_" + Date.now(),
            this.mesh,
            "position",
            frameRate,
            duration,
            this.mesh.position, 
            GridUtils.toWorld(targetGridPos), 
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            this.createEasing(),
            async () => {
                this._isMoving = false; 
                for (let i = 0; i < this.posListeners.length; i++) {
                    await this.posListeners[i](this);
                }
                anim?.stop();
                //this.mesh.position = GridUtils.toWorld(targetGridPos);
                (this.mesh as any).animations?.find(anim => anim.name.includes("idle"))?.play(true);
                //console.log("ending dovisualmove");
                resolve();
            }
        ));
    }

    protected async animateRotation(relativeAngle: number, sound = "null"): Promise<void> {
        this._isMoving = true;
        const targetAngle = this.mesh.rotation.y + relativeAngle;

        if (sound) SoundManager.playSound(sound);
        return new Promise((resolve) => Animation.CreateAndStartAnimation(
            "rotate_" + Date.now(), // pour pas avoir plusieurs fois le même nom
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
        return {...this.gridPos};
    }

    protected async updateVisualPos(instant?: boolean) {
        if (instant) {
            this.mesh.position = GridUtils.toWorld(this.gridPos);
            this.mesh.rotation = new Vector3(0, this.facingIndex * Math.PI / 2, 0);
        } else {
            const targetWorld = GridUtils.toWorld(this.gridPos);
            if (!this.mesh.position.equalsWithEpsilon(targetWorld, 0.01))
                await this.doVisualMove({...this.gridPos});
            
            const targetAngle = this.facingIndex * Math.PI / 2;
            const angleDiff = targetAngle - this.mesh.rotation.y;
            if (Math.abs(angleDiff) > 0.01)
                await this.animateRotation(angleDiff);
        }
    }

    public reinit() {
        this.mesh.position = GridUtils.toWorld(this.initPos);
        this.mesh.rotation.y = this.initRotation * (Math.PI / 2);
        this.facingIndex = this.initRotation;
        this.gridPos = {...this.initPos};
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

    abstract getState(): EntityState;
    abstract setState(state: EntityState, instant?: boolean): Promise<void>;
}