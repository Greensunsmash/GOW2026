import type { Robot } from "../Entity/Robot";
import type { PlayScene } from "./Scene/PlayScene";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";

export type GoalName = "arrival";

export type ArrivalGoalArgs = {flagPos: GridPoint};
export type GoalArgs = ArrivalGoalArgs;

export type Goal = {name: GoalName, args: GoalArgs};

export class ExecutionContext {
    private robot: Robot;
    private scene: PlayScene;

    constructor(robot: Robot, scene: PlayScene) {
        this.robot = robot;
        this.scene = scene;
    }

    getRobot(): Robot {
        return this.robot;
    }

    newLevel(robot: Robot) {
        this.robot = robot;
    }

    setGoal(goal: Goal) {
        console.log("mdr");
        switch (goal.name) {
            case "arrival":
                this.robot.posListeners.push((pos: GridPoint) => {
                    console.log(pos);
                    console.log(goal.args.flagPos);
                    if (GridUtils.equals(pos, goal.args.flagPos)) {
                        console.log("hey");
                        this.scene.nextIsland();
                    }
                });
                break;
            default:
                break;
        }
    }
}