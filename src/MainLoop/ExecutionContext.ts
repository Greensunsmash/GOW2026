import { ThinSSAO2BlurPostProcess } from "@babylonjs/core/PostProcesses/thinSSAO2BlurPostProcess";
import type { Mob } from "../Entity/Mob";
import type { MarcoBozo } from "../Entity/Robot";
import type { Level } from "../Environment/Level";
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

export type MobIntention = {
    nextPos: GridPoint;
    status: "FORWARD" | "BOUCING" | "STUCK";
};

export class ExecutionContext {
    private level: Level;
    private robot: MarcoBozo;
    private scene: PlayScene;
    private memory: Memory;

    constructor(level: Level, scene: PlayScene) {
        this.robot = level.getRobot();
        this.level = level;
        this.scene = scene;
        this.memory = Memory.get();
    }

    public getRobot(): MarcoBozo {
        return this.robot;
    }

    public newLevel(level: Level) {
        this.level = level;
        this.robot = level.getRobot();
        this.robot.posListeners = [];
    }

    public async nextTick() {
        const intentions: Map<Mob, MobIntention> = new Map();
        const mobs = this.level.getMobs();
        for (const mob of mobs) {
            intentions.set(mob, mob.nextTickIntention());
        }

        const checkCollisions = (mob: Mob, intention: MobIntention) => {
            if (!this.level.isWalkable(intention.nextPos))
                return true;

            for (const otherMob of mobs) {
                if (mob === otherMob)
                    continue;

                const otherMobInt = intentions.get(otherMob);
                if (otherMobInt
                    && (
                        // destination identique
                        GridUtils.equals(intention.nextPos, otherMobInt.nextPos)
                        // inversement des positions (collisions frontales)
                        || (GridUtils.equals(mob.getVisualGridPos(), otherMobInt.nextPos) && GridUtils.equals(otherMob.getVisualGridPos(), intention.nextPos))
                        
                        || (true)
                    )
                ) {
                    return true;
                }
            }
        }

        let resolving = true;
        while (resolving) {
            resolving = false;
            for (const mob of mobs) {
                const mobInt = intentions.get(mob);
                if (!mobInt)
                    continue;

                if (mobInt.status === "STUCK")
                    continue;

                
                if ({
                        mobInt.collisionEncounter = true;
                        resolving = true;
                    }
                }
            }
        }
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
                        if (!this.robot.hasItem(goal.args.itemType))
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