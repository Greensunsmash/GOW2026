import type { Robot } from "../Entity/Robot";
import type { PlayScene } from "./Scene/PlayScene";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { Memory, type stepInfo } from "../Language/Memory";

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

    public getRobot(): Robot {
        return this.robot;
    }

    public newLevel(robot: Robot) {
        this.robot = robot;
    }

    public setGoal(goal: Goal) {
        switch (goal.name) {
            case "arrival":
                this.robot.posListeners.push((pos: GridPoint) => {
                    if (GridUtils.equals(pos, goal.args.flagPos)) {
                        this.scene.nextLeaf();
                    }
                });
                break;
            default:
                break;
        }
    }

    public stepBack() {
        const stepInfo: stepInfo = this.memory.stepBack();
        if (stepInfo.empty) {
            console.log("no further step back");
            return false;
        }
        switch (stepInfo.instName) {
            case "forward": 
                this.getRobot().visualMoveBackward(true);
                console.log("b");
                break;
            case "backward": 
                this.getRobot().visualMoveForward(true);
                console.log("f");
                break;
            case "left": 
                this.getRobot().visualTurnRight(true);
                console.log("r");
                break;
            case "right": 
                this.getRobot().visualTurnLeft(true);
                console.log("l");
                break;
        }
        Memory.print();
        return true;
    }

    public async nextStep(instantMove: boolean = true): Promise<boolean> {
        const stepInfo: stepInfo = this.memory.nextStep();
        if (stepInfo.empty) {
            console.log("no further step");
            return false;
        }
        switch (stepInfo.instName) {
            case "forward": 
                await this.getRobot().visualMoveForward(instantMove);
                console.log("f");
                break;
            case "backward": 
                await this.getRobot().visualMoveBackward(instantMove);
                console.log("b");
                break;
            case "left": 
                await this.getRobot().visualTurnLeft(instantMove);
                console.log("l");
                break;
            case "right": 
                await this.getRobot().visualTurnRight(instantMove);
                console.log("r");
                break;
        }
        Memory.print();
        return true;
    }
}