import { ThinSSAO2BlurPostProcess } from "@babylonjs/core/PostProcesses/thinSSAO2BlurPostProcess";
import { Mob } from "../Entity/Mob";
import type { MarcoBozo } from "../Entity/Robot";
import type { Level } from "../Environment/Level";
import type { ItemType, State } from "../Environment/LevelReader";
import { Memory, type GameMode } from "../Language/Memory";
import { GridUtils, type GridPoint } from "../Shared/GridUtils";
import type { PlayScene } from "./Scene/PlayScene";
import { stringArraysEq } from "../Shared/utils";
import { Circe } from "../Entity/Circe";
import { Pig } from "../Entity/Pig";


export type ArrivalGoalArgs = { flagPos: GridPoint };
export type pickupSpecific = { itemType: ItemType };
export type PickupBringGoalArgs = { bringPos: GridPoint, itemType: ItemType };
export type SurviveGoalArgs = {ticks: number};

export type Goal =
    | { name: "arrival"; args: ArrivalGoalArgs }
    | { name: "pickupSpecifics"; args: pickupSpecific }
    | { name: "pickup", args: {}}
    | { name: "pickup_and_bring"; args: PickupBringGoalArgs }
    | {name: "survive", args: SurviveGoalArgs}
    | {name: "kill"};

export type MobIntention = {
    nextPos: GridPoint;
    status: "FORWARD" | "BOUCING" | "STUCK";
    deadDuringTick: boolean;
};

export type CollisionType = {
    type: "OTHERMOB_SAMEDEST" | "OTHERMOB_OTHER" | "WALL" | "VOID" | null;
    mob?: Mob;
};


export class ExecutionContext {
    private level: Level;
    private robot: MarcoBozo;
    private scene: PlayScene;
    private memory: Memory;

    private ticksSinceLastModeChange = 0;
    private totalTicks = 0;
    private ticksToSurvive: number | undefined = undefined;
    private mustKillCirce = false;

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
        this.ticksSinceLastModeChange = 0;
        this.totalTicks = 0;
        this.ticksToSurvive = undefined;
        this.mustKillCirce = true;
    }

    // BOUCLE S'EXECUTANT A CHAQUE TICK DE JEU
    public async nextTick(robotIntention?: GridPoint, instant?: boolean) {
        console.log("[TICKS] ENTERING NEXT TICK.");

        let robotDead: boolean = false;
        let deadFromVoid : boolean = false;
        let robotBounce: boolean = false;

        // sauvegarder les états des entités
        this.level.pushEntityState();

        this.memory.onNextTick(this.ticksSinceLastModeChange, this.totalTicks);

        // process l'intention du robot

        // s'il ne bouge pas ce tick (turn left, right, attendre),
        // son intention c'est juste sa position actuelle (flemmard)
        if (robotIntention === undefined)
            robotIntention = this.robot.getVisualGridPos();

        // 1 : verif  collisions robot/obstacle-mur
        if (this.level.isObstacle(robotIntention)) {
            if (this.memory.getGameMode() === "PIGMODE") {
                // il rebondit
                console.log("[TICKS] robot bouncing");
                robotIntention = this.robot.getVisualGridPos();
                robotBounce = true;
            } else {
                console.log("[TICKS] robot getting into an obstacle => dead.");
                robotDead = true; 
            }
        }
        const mobs = this.level.getMobs();
        if (this.memory.getGameMode() === "PIGMODE") {
            for (const mob of mobs) {
                if (mob instanceof Pig && GridUtils.equals(mob.getVisualGridPos(), robotIntention)) { 
                    console.log("[TICKS] robot bouncing because of predicted collision with pig");
                    robotIntention = this.robot.getVisualGridPos();
                    robotBounce = true;
                }
            }
        }

        if (this.level.isVoidBelow(robotIntention)) {
            // plus tard, gérer séparément les visuels de la mort par obstacle et la mort par chute
            robotDead = true;
            deadFromVoid = true;
        }
        if (!GridUtils.equals(robotIntention, this.robot.getVisualGridPos()) || robotBounce) {
            if (instant)
                
                this.robot.doMove(robotIntention, robotBounce);
            else
                
                await this.robot.doVisualMove(robotIntention, robotBounce);
        }

        // 1.5 : 2eme check collisions robot/mob

        for (const mob of mobs) {
            if (GridUtils.equals(mob.getVisualGridPos(), this.robot.getVisualGridPos())) { 
                if (this.mustKillCirce && mob instanceof Circe) {
                    this.scene.onGoalReached();
                    return;
                }
                console.warn("[TICKS] Deadly robot collision !");
                robotDead = true;
            }
        }

        
        // Si le robot est déjç mort, inutile d'aller plus loin n'est-il pas?
        if (robotDead) {
            console.warn("[TICKS] ROBOT DEAD!!!");
            if (deadFromVoid) this.scene.onRobotDead("Le robot est tombée dans le vide");
            else this.scene.onRobotDead();
            return;
        }

        // recueillir les intentions des mobs
        const intentions: Map<Mob, MobIntention> = new Map();
        for (const mob of mobs) {
            intentions.set(mob, mob.nextTickIntention());
        }

        // 2 : vérifier les collisions mobs/mobs ou mobs/obstacles ou les chutes de mobs
        const checkCollisions = (mob: Mob, intention: MobIntention): CollisionType => {
            //console.log("mob " , mob, " intention is on ", intention);
            if (this.level.isObstacle(intention.nextPos))
                return {type: "WALL"};

            if (this.level.isVoidBelow(intention.nextPos)) {
                console.log("[TICKS] in checkcoll : void collision");
                return {type: "VOID"};
            }

            for (const otherMob of mobs) {
                if (mob === otherMob)
                    continue;

                const otherMobInt = intentions.get(otherMob);
                if (otherMobInt) {
                    if (GridUtils.equals(intention.nextPos, otherMobInt.nextPos))
                        return {type: "OTHERMOB_SAMEDEST", mob: otherMob};
                    else if ((GridUtils.equals(mob.getVisualGridPos(), otherMobInt.nextPos) && GridUtils.equals(otherMob.getVisualGridPos(), intention.nextPos)) || (GridUtils.equals(intention.nextPos, otherMob.getVisualGridPos())))
                        return {type: "OTHERMOB_OTHER", mob: otherMob};
                }
            }

            return {type: null};
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
                if (collision.type) {
                    resolving = true;

                    /*if (mobInt.status === "FORWARD") {
                        mobInt.status = "BOUCING";
                    } else {
                        mobInt.status = "STUCK";
                    }
                    mobInt.nextPos = mob.getVisualGridPos();*/

                    if (collision.type === "WALL") {
                        if (mobInt.status === "FORWARD") {
                            mobInt.status = "BOUCING";
                        } else {
                            mobInt.status = "STUCK";
                        }
                        // Tu ne bouges pas.
                        mobInt.nextPos = mob.getVisualGridPos();
                    } else if (collision.type === "VOID") {
                        console.log("[TICKS] mob dead : ", mob);
                        mobInt.deadDuringTick = true;
                    } else if (collision.type === "OTHERMOB_SAMEDEST") {
                        /*const otherMobInt = intentions.get(collision);
                        if (!otherMobInt) continue;
                        if (otherMobInt.status === "FORWARD") {
                            otherMobInt.status = "BOUCING";
                        } else {
                            otherMobInt.status = "STUCK";
                        }
                        // Tu ne bouges pas.
                        otherMobInt.nextPos = collision.getVisualGridPos();*/
                        const myIndex = mobs.indexOf(mob);
                        const otherIndex = mobs.indexOf(collision.mob!);
                        
                        if (myIndex > otherIndex) {
                            // je perds, je rebondis
                            mobInt.status = "BOUCING";
                        } else {
                            // je gagne, je reste bloqué ce tick
                            mobInt.status = "STUCK";
                        }
                        mobInt.nextPos = mob.getVisualGridPos();
                    } else if (collision.type === "OTHERMOB_OTHER") {
                        if (mobInt.status === "FORWARD") {
                            mobInt.status = "BOUCING";
                        } else {
                            mobInt.status = "STUCK";
                        }
                        // Tu ne bouges pas.
                        mobInt.nextPos = mob.getVisualGridPos();
                    }
                }
            }
        }

        // 3 : visuel cochons
        const mobMovePromises = mobs.map(mob => {
            const int = intentions.get(mob);
            if (int)
                return intentions.get(mob) && mob.doNextTick(int, instant)
        }).filter(mob => !!mob);
        await Promise.all(mobMovePromises);

        // 4 : 2eme check collision robot/cochons
        for (const mob of mobs) {
            if (GridUtils.equals(mob.getVisualGridPos(), this.robot.getVisualGridPos())) { 
                console.warn("[TICKS] Deadly robot collision !");
                this.scene.onRobotDead();
                return;
            }
        }

        // 4 : vérif. que ça fait pas 3 tours qu'on est en mode groink groink
        if (this.memory.getGameMode() === "PIGMODE"
            && this.ticksSinceLastModeChange >= 2) {
                this.memory.setGameMode("NORMAL");
                this.robot.backToACuteLittleRobot();
            }

        // gestion des interactions
        // on sauvegarde le mode (normal/pig) avant toute interaction,
        // puisque celles-ci peuvent modifier le mode (les sir c eyes)
        // ainsi on peut savoir si pendant ce tick on a changé de mode ou pas
        // pour pouvoir décider si on réniit. ou incrémente el countor
        const gmBeforeInteract = this.memory.getGameMode();

        const interactablesAtRobotPos = this.level.getInteratablesAt(this.robot.getVisualGridPos());
        for (const int of interactablesAtRobotPos) {
            await int.onInteract(this.robot);
        }

        if (this.memory.getGameMode() === "PIGMODE") {
            if (gmBeforeInteract === "NORMAL")
                this.ticksSinceLastModeChange = 0;
            else
                this.ticksSinceLastModeChange++;
        }

        this.totalTicks++;
        console.log("total ticks passed are now ", this.totalTicks);

        if (this.ticksToSurvive && this.totalTicks >= this.ticksToSurvive) {
            this.scene.onGoalReached();
            return;
        }
        
        this.scene.modeUpdate();

        console.log("[TICKS] TICK ENDED.");
    }

    public async prevTick(instant?: boolean) {
        const gmStackInfo = this.memory.onPrevTick();
        if (!gmStackInfo) {
            console.error("ctx.prevTick : call on memory.onPrevTick returned undefined (tas vu le msg derreur trop pro ehehhh)");
            return;
        }
        this.ticksSinceLastModeChange = gmStackInfo?.ticksSinceLastModeChange;
        this.totalTicks = gmStackInfo?.totalTicks;
        this.scene.modeUpdate();
        await this.level.popEntityState(instant);
    }

    public setGoals(goals: Goal[]) {
        //console.log(goals);
        for (const goal of goals) {
            if (goal.name === "survive") {
                this.ticksToSurvive = goal.args.ticks;
            }
            if (goal.name === "kill") {
                console.log("setting goal to kill");
                this.mustKillCirce = true;
            }
        }
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
                        //console.log(goal);
                        if (!stringArraysEq(this.robot.getCarriedItems(), this.level.getAllItemTypes()))
                            unreached = true;
                        break;
                    default:
                        unreached = true;
                        break;
                }
            }
            if (unreached)
                this.scene.onGoalUnreached();
            else
                this.scene.onGoalReached();
        });
    }

    public die(msg?: string) {
        this.scene.onRobotDead(msg);
    }
}