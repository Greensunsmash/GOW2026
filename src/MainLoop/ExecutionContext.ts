import type { Robot } from "../Entity/Robot";
import type { PlayScene } from "./Scene/PlayScene";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { Memory } from "../Language/Memory";

export type GoalName = "arrival";

export type ArrivalGoalArgs = {flagPos: GridPoint};
export type GoalArgs = ArrivalGoalArgs;

export type Goal = {name: GoalName, args: GoalArgs};

export class ExecutionContext {
    private robot: Robot;
    private scene: PlayScene;
    private memory: Memory;

    constructor(robot: Robot, scene: PlayScene) {
        this.robot = robot;
        this.scene = scene;
        this.memory = Memory.get();
    }

    getRobot(): Robot {
        return this.robot;
    }

    newLevel(robot: Robot) {
        this.robot = robot;
    }

    setGoal(goal: Goal) {
        switch (goal.name) {
            case "arrival":
                this.robot.posListeners.push((pos: GridPoint) => {
                    if (GridUtils.equals(pos, goal.args.flagPos)) {
                        this.scene.nextIsland();
                    }
                });
                break;
            default:
                break;
        }
    }
}