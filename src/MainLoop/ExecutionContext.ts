import type { MarcoBozo } from "../Entity/Robot";
import type { ItemType, State } from "../Environment/LevelReader";
import { Memory } from "../Language/Memory";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { PlayScene } from "./Scene/PlayScene";


export type ArrivalGoalArgs = {flagPos: GridPoint};
export type PickupGoalArgs = {itemType: ItemType};
export type PickupBringGoalArgs = {bringPos: GridPoint, itemType: ItemType};
export type GoalArgs = ArrivalGoalArgs | PickupGoalArgs | PickupBringGoalArgs;

export type Goal =
    | { name: "arrival"; args: ArrivalGoalArgs }
    | { name: "pickup"; args: PickupGoalArgs }
    | { name: "pickup_and_bring"; args: PickupBringGoalArgs };

export class ExecutionContext {
    private robot: MarcoBozo;
    private scene: PlayScene;
    private memory: Memory;

    constructor(robot: MarcoBozo, scene: PlayScene) {
        this.robot = robot;
        this.scene = scene;
        this.memory = Memory.get();
    }

    public getRobot(): MarcoBozo {
        return this.robot;
    }

    public newLevel(robot: MarcoBozo) {
        this.robot.posListeners = [];
        this.robot = robot;
    }

    public setGoals(goals: Goal[]) {
        console.log(goals);
        this.memory.setOnProgramEnd(() => {
            let unreached: boolean = false;
            for (const goal of goals) {
                switch (goal.name) {
                    case "arrival":
                        const robotPos = this.robot.getVisualGridPos();
                        if (!GridUtils.equals(robotPos, goal.args.flagPos)) {
                            unreached = true;
                        } 
                        break;
                    case "pickup":
                        console.log(goal);
                        if (this.robot.getCarriedItem() !== goal.args.itemType)
                            unreached = true;
                        break;
                    default:
                        break;
                }
            }
            if (unreached)
                this.scene.onGoalUnreached();
            else
                this.scene.onGoalReached();
        });
    }
}