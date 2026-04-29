import { ThinSSAO2BlurPostProcess } from "@babylonjs/core/PostProcesses/thinSSAO2BlurPostProcess";
import type { Mob } from "../Entity/Mob";
import type { MarcoBozo } from "../Entity/Robot";
import type { Level } from "../Environment/Level";
import type { ItemType, State } from "../Environment/LevelReader";
import { Memory } from "../Language/Memory";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { PlayScene } from "./Scene/PlayScene";
import { stringArraysEq } from "../Shared/utils";


export type ArrivalGoalArgs = { flagPos: GridPoint };
export type pickupSpecific = { itemType: ItemType };
export type PickupBringGoalArgs = { bringPos: GridPoint, itemType: ItemType };

export type Goal =
    | { name: "arrival"; args: ArrivalGoalArgs }
    | { name: "pickupSpecifics"; args: pickupSpecific }
    | { name: "pickup", args: {}}
    | { name: "pickup_and_bring"; args: PickupBringGoalArgs };

export type MobIntention = {
    nextPos: GridPoint;
    status: "FORWARD" | "BOUCING" | "STUCK";
    deadDuringTick: boolean;
};

export type CollisionType = "OTHERMOB" | "WALL" | "VOID" | null;

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

    public async nextTick(robotIntention?: GridPoint, instant?: boolean) {
        this.level.pushMobState();

        let robotDead: boolean = false;
        const intentions: Map<Mob, MobIntention> = new Map();
        const mobs = this.level.getMobs();
        for (const mob of mobs) {
            intentions.set(mob, mob.nextTickIntention());
        }

        if (robotIntention === undefined)
            robotIntention = this.robot.getVisualGridPos();

        if (!this.level.isWalkable(robotIntention)) {
            // plus tard, gérer séparément la mort par obstacle et la mort par chute
            robotDead = true;
        }

        for (const mob of mobs) {
            const mobInt = intentions.get(mob);
            if (!mobInt) continue;

            const mobPos = mob.getVisualGridPos();

            if (GridUtils.equals(mobInt.nextPos, robotIntention) // meme case dest.
                || GridUtils.equals(robotIntention, mob.getVisualGridPos()) // robot fonce sur mob
                || (GridUtils.equals(mobInt.nextPos, this.robot.getVisualGridPos()) &&
                    GridUtils.equals(robotIntention, mobPos))) { // coll. frontale
                console.warn("Deadly collision !");
                robotDead = true;
            }
        }

        const checkCollisions = (mob: Mob, intention: MobIntention): CollisionType => {
            if (this.level.isObstacle(intention.nextPos))
                return "WALL";

            if (this.level.isVoidBelow(intention.nextPos))
                return "VOID";

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
                        // 
                        || (otherMobInt.status === "STUCK" && GridUtils.equals(intention.nextPos, otherMob.getVisualGridPos()))
                    )
                ) {
                    return "OTHERMOB";
                }
            }

            return null;
        }

        let resolving = true;
        while (resolving) {
            resolving = false;
            for (const mob of mobs) {
                const mobInt = intentions.get(mob);
                if (!mobInt)
                    continue;

                if (mobInt.status === "STUCK" || mobInt.deadDuringTick)
                    continue;

                const collision = checkCollisions(mob, mobInt);
                if (collision) {
                    resolving = true;
                    if (collision === "WALL") {
                        if (mobInt.status === "FORWARD") {
                            const cur = mob.getVisualGridPos();
                            const dx = mobInt.nextPos.x - cur.x;
                            const dz = mobInt.nextPos.z - cur.z;

                            mobInt.status = "BOUCING";
                            mobInt.nextPos = { x: cur.x - dx, y: cur.y, z: cur.z - dz };
                        } else {
                            mobInt.status = "STUCK";
                            mobInt.nextPos = mob.getVisualGridPos();
                        }
                    } else if (collision === "VOID") {
                        mobInt.deadDuringTick = true;
                    } else if (collision === "OTHERMOB") {
                        mobInt.status = "STUCK";
                        mobInt.nextPos = mob.getVisualGridPos();
                    }
                }
            }
        }

        if (instant) {
            for (const mob of mobs) {
                await mob.doNextTick(intentions.get(mob)!, true);
            }

            if (!GridUtils.equals(this.robot.getVisualGridPos(), robotIntention))
                this.robot.doMove(robotIntention);
        } else {
            const promises = mobs.map(mob => mob.doNextTick(intentions.get(mob)!));
            
            if (!GridUtils.equals(this.robot.getVisualGridPos(), robotIntention))
                promises.push(this.robot.doVisualMove(robotIntention))

            await Promise.all(promises);
        }

        if (robotDead) {
            console.warn("DEAD!!!");
            // faire quelque chose !
            this.scene.onRobotDead();
        }
    }

    public async prevTick() {
        this.level.popMobState();
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
                        if (!stringArraysEq(this.robot.getCarriedItems(), this.level.getAllItems()))
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