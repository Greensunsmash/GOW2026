import { Vector3, type Scene } from "@babylonjs/core";
import { State, type Map2 } from "./LevelReader";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { Robot } from "../Entity/Robot";

export class Level {
    private map : Map2;
    private readonly drh : AssetLibrary;
    private readonly scene : Scene;
    robot? : Robot;

    constructor(map : Map2, drh : AssetLibrary, scene : Scene) {
        this.map = map;
        this.drh = drh;
        this.scene = scene;

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                let pos : Vector3 = new Vector3(x, 0, y);
                let tile : State = this.map[y][x];
                
                switch(tile) {
                    case State.RobotStart:
                        this.robot = this.createRobot(pos);
                        break;
                    case State.Wall:
                        this.createWall(pos);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    createRobot(pos : Vector3) : Robot {
        return new Robot(this.drh, pos);
    }

    createWall(pos : Vector3) {
        this.drh.createSingleInstance(
            "wall",
            pos
        );
    }
}