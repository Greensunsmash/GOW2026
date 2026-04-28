import { TransformNode, Vector3, type Scene } from "@babylonjs/core";
import "babylonjs-materials";
import { MarcoBozo } from "../Entity/Robot";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { State, type ItemType, type Map3 } from "./LevelReader";
import { ItemDisplay } from "./ItemDisplay";

export class Level {
    private map: Map3;
    private readonly drh: AssetLibrary;
    private readonly scene: Scene;
    private robot?: MarcoBozo;
    private meshes: TransformNode[] = [];
    private items: ItemDisplay[] = [];

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
                        default:
                            break;
                    }
                }
            }
        }
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

    public getItemAt(gridPos: GridPoint): ItemDisplay | null {
        if (!this.isWalkable(gridPos)) 
            return null;
        
        const item = this.items.find(it => GridUtils.equals(it.getGridPos(), gridPos));
        return item ?? null;
    }

    public isWalkable(gridPos: GridPoint) {
        //console.log("testing if " + GridUtils.toString(gridPos) + " is walkable");
        //console.log("map shape is " + this.mapShape());

        if (gridPos.x < 0 || gridPos.y < 0 || gridPos.z < 0)
            return false;
        if (gridPos.y >= this.map.length)
            return false;
        if (gridPos.z >= this.map[gridPos.y].length)
            return false;
        if (gridPos.x >= this.map[gridPos.y][gridPos.z].length)
            return false;

        //console.log("map dimensions tests passed, processing wall checked");
        const nextState = this.map[gridPos.y][gridPos.z][gridPos.x];
        if (nextState == State.Wall)
            return false;

        // On marche que sur du sol owww
        if (gridPos.y - 1 >= 0) {
            const nextStateBelow = this.map[gridPos.y - 1][gridPos.z][gridPos.x];
            if (nextStateBelow != State.Ground)
                return false;
        }

        //console.log("tile is walkable");
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

    public reinitLevel() {
        this.robot?.reinit();
        for (const item of this.items)
            item.setDisplay(true);
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

        this.map = [] as Map3;
    }

    getMeshes(): TransformNode[] {
        return this.meshes;
    }
}