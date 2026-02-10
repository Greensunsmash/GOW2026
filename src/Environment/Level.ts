import { Vector3, type Scene } from "@babylonjs/core";
import { Robot } from "../Entity/Robot";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { State, type Map3 } from "./LevelReader";

export class Level {
    private map : Map3;
    private readonly drh : AssetLibrary;
    private readonly scene : Scene;
    private robot? : Robot;

    constructor(map : Map3, drh : AssetLibrary, scene : Scene) {
        this.map = map;
        this.drh = drh;
        this.scene = scene;

        for (let y = 0; y < this.map.length; y++) {
            for (let z = 0; z < this.map[y].length; z++) {
                for (let x = 0; x < this.map[y][z].length; x++) {
                    let gridPos : GridPoint = {x: x, y: y, z:z};
                    /*
                        /!\ ATTENTION
                        Avertissement national
                        Inversion y et z implicite (dans toWorld)
                    */
                    let pos : Vector3 = GridUtils.toWorld(gridPos);
                    let tile : State = this.map[y][z][x];
                    
                    switch(tile) {
                        case State.RobotStart:
                            console.log("grid pos is " + GridUtils.toString(gridPos));
                            console.log("world pos is " + pos.toString());
                            this.robot = this.createRobot(gridPos);
                            break;
                        case State.Wall:
                            this.createWall(pos);
                            break;
                        case State.Ground:
                            this.createWall(pos);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    createRobot(gridPos : GridPoint) : Robot {
        return new Robot(this.drh, this.scene, this, gridPos);
    }

    createWall(pos : Vector3) {
        this.drh.printLoadedAssets();
        this.drh.createSingleInstance(
            "wall",
            pos
        );
    }

    getRobot() : Robot {
        if (!this.robot)
            throw new Error("this level doesnt have any robot.");
        return this.robot;
    }

    mapShape() : [number, number, number] {
        return [this.map[0][0].length, this.map.length, this.map[0].length]; // x,y,z
    }

    isWalkable(gridPos: GridPoint) {
        console.log("testing if " + GridUtils.toString(gridPos) + " is walkable");
        console.log("map shape is " + this.mapShape());

        if (gridPos.x < 0 || gridPos.y < 0 || gridPos.z < 0)
            return false;
        if (gridPos.y >= this.map.length)
            return false;
        if (gridPos.z >= this.map[gridPos.y].length)
            return false;
        if (gridPos.x >= this.map[gridPos.y][gridPos.z].length)
            return false;

        console.log("map dimensions tests passed, processing wall checked");
        const nextState = this.map[gridPos.y][gridPos.z][gridPos.x];
        if (nextState == State.Wall)
            return false;

        console.log("tile is walkable");
        return true;
    }
}