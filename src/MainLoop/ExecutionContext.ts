import type { Robot } from "../Entity/Robot";
import type { PlayScene } from "./Scene/PlayScene";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import { Memory, type StepInfo } from "../Language/Memory";
import { OneButtonModal } from "../MRGUI/windows/OneButtonModal";

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

    public stepBack() {
        const stepInfo: StepInfo = this.memory.stepBack();
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

    public stepToFirst() {
        while (this.stepBack());
    }

    public async nextStep(instantMove: boolean = true): Promise<boolean> {
        const stepInfo: StepInfo = this.memory.nextStep();
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

    public async stepToLast() {
        while (await this.nextStep(true));
    }
}