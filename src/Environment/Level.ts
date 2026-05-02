import { TransformNode, Vector3, type Scene, type Vector } from "@babylonjs/core";
import "babylonjs-materials";
import { MarcoBozo } from "../Entity/Robot";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { State, type ItemType, type MobType, type Map3 } from "./LevelReader";
import { ItemDisplay } from "../Entity/ItemDisplay";
import { Mob, type MobState } from "../Entity/Mob";
import { Pig } from "../Entity/Pig";
import { Interactable, } from "../Entity/Interactable";
import type { EntityState, GridEntity } from "../Entity/GridEntity";
import { SirCEye } from "../Entity/SirCEye";

export class Level {
    private map: Map3;
    private readonly drh: AssetLibrary;
    private readonly scene: Scene;
    private robot?: MarcoBozo;
    private meshes: TransformNode[] = [];
    private otherEntities: GridEntity[] = [];
    private entityStates: (Map<GridEntity, EntityState>)[] = [];

    constructor(map: Map3, drh: AssetLibrary, scene: Scene) {
        this.map = map;
        this.drh = drh;
        this.scene = scene;
    }

    public async init() {
        for (let y = 0; y < this.map.length; y++) {
            for (let z = 0; z < this.map[y].length; z++) {
                for (let x = 0; x < this.map[y][z].length; x++) {
                    let gridPos: GridPoint = { x: x, y: y, z: z };
                    /*
                        /!\ ATTENTION
                        Avertissement national
                        Inversion y et z implicite (dans toWorld)
                    */
                    let pos: Vector3 = GridUtils.toWorld(gridPos);
                    let tile: State = this.map[y][z][x];

                    switch (tile) {
                        case State.RobotStart:
                            console.log("creating a new robot, at " + GridUtils.toString(gridPos));
                            this.robot = this.createRobot(gridPos);
                            console.log("robot pos is really " + GridUtils.toString(this.robot.getVisualGridPos()));
                            break;
                        case State.Wall:
                            this.meshes.push(this.createWall(pos));
                            break;
                        case State.Ground:
                            this.meshes.push(this.createGround(pos));
                            break;
                        case State.Flag:
                            this.meshes.push(this.createFlag(pos));
                            break;
                        case State.Item:
                            this.otherEntities.push(new ItemDisplay(this.drh, this, gridPos, State.Item));
                            break;
                        case State.PigUp:
                            this.otherEntities.push(new Pig(this.drh, this, gridPos, 0));
                            break;
                        case State.PigRight:
                            this.otherEntities.push(new Pig(this.drh, this, gridPos, 1));
                            break;
                        case State.PigDown:
                            this.otherEntities.push(new Pig(this.drh, this, gridPos, 2));
                            break;
                        case State.PigLeft:
                            this.otherEntities.push(new Pig(this.drh, this, gridPos, 3));
                            break;
                        case State.SirCEyeInteractor:
                            this.otherEntities.push(new SirCEye(this.drh, this, gridPos));
                            break;
                        case State.CursedGround:
                            const gridPosAbove = {...gridPos};
                            gridPosAbove.y += 1;
                            this.otherEntities.push(new SirCEye(this.drh, this, gridPosAbove));
                            this.meshes.push(this.createCursedGround(pos));
                            break;
                    default:
                            break;
                    }
                }
            }
        }

        this.pushEntityState();
    }

    private createRobot(gridPos: GridPoint): MarcoBozo {
        return new MarcoBozo(this.drh, this.scene, this, gridPos);
    }

    private createGround(pos: Vector3): TransformNode {
        return this.drh.createSingleInstance("ground", pos, true);
    }

    private createCursedGround(pos: Vector3): TransformNode {
        return this.drh.createSingleInstance("cursed", pos, true);
    }

    private createWall(pos: Vector3): TransformNode {
        return this.drh.createSingleInstance("wall", pos, true);
    }

    private createFlag(pos: Vector3): TransformNode {
        return this.drh.createSingleInstance("heart", pos, false, 1.0);
    }


    public getRobot(): MarcoBozo {
        if (!this.robot)
            throw new Error("this level doesnt have any robot.");
        return this.robot;
    }

    public mapShape(): [number, number, number] {
        return [this.map[0][0].length, this.map.length, this.map[0].length]; // x,y,z
    }

    public getVisualCenter(): Vector3 {
        const shape = this.mapShape();

        const centerX = (shape[0] - 1) / 2;
        const centerY = (shape[1] - 1) / 2;
        const centerZ = (shape[2] - 1) / 2;

        return new Vector3(centerX, centerY, centerZ);
    }

    public getItems(): ItemDisplay[] {
        return this.otherEntities.filter(e => e instanceof ItemDisplay);
    }

    public getAllItemTypes(): ItemType[] {
        return this.getItems().map(it => it.getType());
    }

    public getItemAt(gridPos: GridPoint): ItemDisplay | null {
        if (!this.isWalkable(gridPos)) 
            return null;
        
        const item = this.getItems().find(it => GridUtils.equals(it.getVisualGridPos(), gridPos));
        return item ?? null;
    }

    public getMobs() {
        return this.otherEntities.filter(e => e instanceof Mob);
    }

    public getInteratablesAt(gridPos: GridPoint): Interactable[] {
        return this.otherEntities
                    .filter(et => et instanceof Interactable)
                    .filter(int => GridUtils.equals(gridPos, int.getVisualGridPos()));
    }

    public isBeyondLimits(gridPos: GridPoint) {
        if (gridPos.x < 0 || gridPos.y < 0 || gridPos.z < 0)
            return true;
        if (gridPos.y >= this.map.length)
            return true;
        if (gridPos.z >= this.map[gridPos.y].length)
            return true;
        if (gridPos.x >= this.map[gridPos.y][gridPos.z].length)
            return true;

        return false;
    }

    public isVoidBelow(gridPos: GridPoint) {
        if (this.isBeyondLimits(gridPos))
            return true;

        if (gridPos.y - 1 >= 0) {
            const nextStateBelow = this.map[gridPos.y - 1][gridPos.z][gridPos.x];
            if ((nextStateBelow != State.Ground)
                && (nextStateBelow != State.CursedGround)) {
                console.log("grid pos ", GridUtils.add(gridPos, {x:0,y:-1,z:0}), "is deadly. : it's " + nextStateBelow);
                return true;
            } else
                return false;
        }

        return false;
    }

    public isObstacle(gridPos: GridPoint) {
        if (this.isBeyondLimits(gridPos))
            return false;

        const nextState = this.map[gridPos.y][gridPos.z][gridPos.x];
        if (nextState == State.Wall) {
            console.log(GridUtils.toString(gridPos) + " is an obstacle");
            return true;
        }
        return false;
    }

    public isWalkable(gridPos: GridPoint) {
        if (this.isVoidBelow(gridPos))
            return false;

        if (this.isObstacle(gridPos))
            return false;

        return true;
    }

    public findStatePos(state: State): GridPoint | null {
        for (let z = 0; z < this.map.length; z++) {
            const layer = this.map[z];

            for (let y = 0; y < layer.length; y++) {
                const row = layer[y];

                for (let x = 0; x < row.length; x++) {
                    if (row[x] === state) {
                        return { x: x, y: z, z: y };
                    }
                }
            }
        }

        return null; // aucun state trouvé
    }

    public pushEntityState() {
        const currState: Map<GridEntity, EntityState> = new Map();
        for (const ent of this.otherEntities) {
            currState.set(ent, ent.getState());
        }
        currState.set(this.robot!, this.robot!.getState());
        this.entityStates.push(currState);
        console.log(this.entityStates);
    }

    public popEntityState() {
        let currState: Map<GridEntity, EntityState> | undefined = undefined;
        if (this.entityStates.length === 0) {
            console.warn("Cannot load a mob state when mob state stack is empty");
            return;
        } else if (this.entityStates.length === 1) {
            console.warn("popping mob state, but only initial state in stack, so not removing first");
            currState = this.entityStates[0];
        } else {
            currState = this.entityStates.pop();
        }
        console.log(this.entityStates);
        console.log(currState);

        if (!currState) {
            console.warn("hmm alors la je vois pas");
            return;
        }

        this.loadEntityState(currState);
    }

    private loadEntityState(state: Map<GridEntity, EntityState>) {
        for (const ent of state.keys()) {
            const entState = state.get(ent);
            if (!entState)
                continue;
            ent.setState(entState);
        }
        const robotState = state.get(this.robot!);
        this.robot?.setState(robotState!);
    }

    public reinitLevel() {
        const initEntState = this.entityStates[0];
        if (!initEntState) {
            console.warn("reinit level called when no mob state has ever been stored ?? WHAT THE FUCK ??");
            return;
        }
        this.loadEntityState(initEntState);
        this.entityStates.splice(1); // supprime tout apres le premier
        this.robot?.reinit();
        for (const item of this.getItems())
            item.setDisplay(true);
        for (const mob of this.getMobs())
            mob.reinit();
    }

    public dispose() {
        // Dispose le robot
        if (this.robot) {
            this.robot.dispose();
            this.robot = undefined;
        }

        this.meshes.map(mesh => mesh.dispose());
        this.otherEntities.map(e => e.dispose());

        this.map = [] as Map3;
    }

    getMeshes(): TransformNode[] {
        return this.meshes;
    }
}