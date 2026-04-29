import { TransformNode, Vector3, type Scene } from "@babylonjs/core";
import "babylonjs-materials";
import { MarcoBozo } from "../Entity/Robot";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { State, type ItemType, type MobType, type Map3 } from "./LevelReader";
import { ItemDisplay } from "./ItemDisplay";
import type { Mob, MobState } from "../Entity/Mob";
import { Pig } from "../Entity/Pig";

export class Level {
    private map: Map3;
    private readonly drh: AssetLibrary;
    private readonly scene: Scene;
    private robot?: MarcoBozo;
    private meshes: TransformNode[] = [];
    private items: ItemDisplay[] = [];
    private mobs: Mob[] = [];
    private mobStates: (Map<Mob, MobState>)[] = [];

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
                            this.items.push(new ItemDisplay(this.drh, this, pos, State.Item));
                            break;
                        case State.PigUp:
                            this.mobs.push(new Pig(this.drh, this, gridPos, 0));
                            break;
                        case State.PigRight:
                            this.mobs.push(new Pig(this.drh, this, gridPos, 1));
                            break;
                        case State.PigDown:
                            this.mobs.push(new Pig(this.drh, this, gridPos, 2));
                            break;
                        case State.PigLeft:
                            this.mobs.push(new Pig(this.drh, this, gridPos, 3));
                            break;
                    default:
                            break;
                    }
                }
            }
        }

        this.pushMobState();
    }

    private createRobot(gridPos: GridPoint): MarcoBozo {
        return new MarcoBozo(this.drh, this.scene, this, gridPos);
    }

    private createGround(pos: Vector3): TransformNode {
        return this.drh.createSingleInstance("ground", pos, true);
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

    public getAllItems(): ItemType[] {
        return this.items.map(it => it.getType());
    }

    public getItemAt(gridPos: GridPoint): ItemDisplay | null {
        if (!this.isWalkable(gridPos)) 
            return null;
        
        const item = this.items.find(it => GridUtils.equals(it.getGridPos(), gridPos));
        return item ?? null;
    }

    public getMobs() {
        return this.mobs;
    }

    public isVoidBelow(gridPos: GridPoint) {
        if (gridPos.x < 0 || gridPos.y < 0 || gridPos.z < 0)
            return true;
        if (gridPos.y >= this.map.length)
            return true;
        if (gridPos.z >= this.map[gridPos.y].length)
            return true;
        if (gridPos.x >= this.map[gridPos.y][gridPos.z].length)
            return true;

        if (gridPos.y - 1 >= 0) {
            const nextStateBelow = this.map[gridPos.y - 1][gridPos.z][gridPos.x];
            if (nextStateBelow != State.Ground)
                return true;
        }

        return false;
    }

    public isObstacle(gridPos: GridPoint) {
        const nextState = this.map[gridPos.y][gridPos.z][gridPos.x];
        if (nextState == State.Wall)
            return true;

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

    public pushMobState() {
        const currState: Map<Mob, MobState> = new Map();
        for (const mob of this.mobs) {
            currState.set(mob, mob.getState());
        }
        this.mobStates.push(currState);
        console.log(this.mobStates);
    }

    public popMobState() {
        let currState: Map<Mob, MobState> | undefined = undefined;
        if (this.mobStates.length === 0) {
            console.warn("Cannot load a mob state when mob state stack is empty");
            return;
        } else if (this.mobStates.length === 1) {
            console.warn("popping mob state, but only initial state in stack, so not removing first");
            currState = this.mobStates[0];
        } else {
            currState = this.mobStates.pop();
        }
        console.log(this.mobStates);
        console.log(currState);

        if (!currState) {
            console.warn("hmm alors la je vois pas");
            return;
        }

        this.loadMobState(currState);
    }

    private loadMobState(state: Map<Mob, MobState>) {
        for (const mob of state.keys()) {
            const mobState = state.get(mob);
            if (!mobState)
                continue;
            mob.setState(mobState);
        }
    }

    public reinitLevel() {
        const initMobState = this.mobStates[0];
        if (!initMobState) {
            console.warn("reinit level called when no mob state has ever been stored ?? WHAT THE FUCK ??");
            return;
        }
        this.loadMobState(initMobState);
        this.mobStates.splice(1); // supprime tout apres le premier
        this.robot?.reinit();
        for (const item of this.items)
            item.setDisplay(true);
        for (const mob of this.mobs)
            mob.reinit();
    }

    public dispose() {
        // Dispose le robot
        if (this.robot) {
            this.robot.dispose();
            this.robot = undefined;
        }

        for (const mesh of this.meshes) {
            mesh.dispose();
        }

        for (const item of this.items) {
            item.dispose();
        }

        for (const mob of this.mobs) {
            mob.dispose();
        }

        this.map = [] as Map3;
    }

    getMeshes(): TransformNode[] {
        return this.meshes;
    }
}