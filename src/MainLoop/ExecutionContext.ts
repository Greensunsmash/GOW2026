import type { MarcoBozo } from "../Entity/Robot";
import type { PlayScene } from "./Scene/PlayScene";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { Memory, type StepInfo } from "../Language/Memory";
import { OneButtonModal } from "../MRGUI/windows/OneButtonModal";

export type GoalName = "arrival";

export type ArrivalGoalArgs = {flagPos: GridPoint};
export type GoalArgs = ArrivalGoalArgs;

export type Goal = {name: GoalName, args: GoalArgs};

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

    private async onGoalReached() {
        this.scene.stopRun();
        if (this.scene.isDryAttempt()) {
            console.log("dry attempt success");
            new OneButtonModal(
                this.scene.advancedTexture,
                "Objectif atteint",
                "Fermer",
                () => {}
            );
        } else {
            const isAnotherLeafLeft = await this.scene.nextLeaf();
            // si je mets pas ce delay ca marche pas..
            // a investiguer 
            //await new Promise((rs, rj) => setTimeout(rs, 500));
            if (isAnotherLeafLeft)
                this.scene.scene.onAfterRenderObservable.addOnce(async () => await this.scene.run());
        }
    }

    public setGoal(goal: Goal) {
        switch (goal.name) {
            case "arrival":
                this.robot.posListeners.push((pos: GridPoint) => {
                    if (GridUtils.equals(pos, goal.args.flagPos)) {
                        console.log("here");
                        this.onGoalReached();
                    }
                });
                break;
            default:
                break;
        }
    }
}