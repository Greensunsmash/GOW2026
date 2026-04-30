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

    private ticksSinceLastModeChange = 0;

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
    }

    // BOUCLE S'EXECUTANT A CHAQUE TICK DE JEU
    public async nextTick(robotIntention?: GridPoint, instant?: boolean) {
        let robotDead: boolean = false;
        let robotBounce: boolean = false;

        // sauvegarder les états des entités
        this.level.pushEntityState();
        // sauvegarder l'état du jeu (pour qu'il soit réversible)
        this.memory.onNextTick();

        // recueillir les intentions des mobs
        const intentions: Map<Mob, MobIntention> = new Map();
        const mobs = this.level.getMobs();
        for (const mob of mobs) {
            intentions.set(mob, mob.nextTickIntention());
        }

        // vérifier les collisions mobs/mobs ou mobs/obstacles ou les chutes de mobs
        const checkCollisions = (mob: Mob, intention: MobIntention): CollisionType => {
            console.log("mob " , mob, " intention is on ", intention);
            if (this.level.isObstacle(intention.nextPos))
                return "WALL";

            if (this.level.isVoidBelow(intention.nextPos)) {
                console.log("in checkcoll : void collision");
                return "VOID";
            }

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
                        console.log("mob dead : ", mob);
                        mobInt.deadDuringTick = true;
                    } else if (collision === "OTHERMOB") {
                        mobInt.status = "STUCK";
                        mobInt.nextPos = mob.getVisualGridPos();
                    }
                }
            }
        }


        // process l'intention du robot

        // s'il ne bouge pas ce tick (turn left, right, attendre),
        // son intention c'est juste sa position actuelle (flemmard)
        if (robotIntention === undefined)
            robotIntention = this.robot.getVisualGridPos();

        if (this.level.isObstacle(robotIntention)) {
            if (this.memory.getGameMode() === "PIGMODE") {
                // il rebondit
                const cur = this.robot.getVisualGridPos();
                const dx = robotIntention.x - cur.x;
                const dz = robotIntention.z - cur.z;
                robotIntention = { x: cur.x - dx, y: cur.y, z: cur.z - dz };
                robotBounce = true;
            } else {
                robotDead = true; 
            }
        }

        // à cet instant, les positions réelles de tous les mobs sont connues

        if (this.level.isVoidBelow(robotIntention)) {
            // plus tard, gérer séparément les visuels de la mort par obstacle et la mort par chute
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

        if (instant) {
            for (const mob of mobs) {
                await mob.doNextTick(intentions.get(mob)!, true);
            }

            if (!GridUtils.equals(this.robot.getVisualGridPos(), robotIntention))
                this.robot.doMove(robotIntention, robotBounce);
        } else {
            const promises = mobs.map(mob => mob.doNextTick(intentions.get(mob)!));
            
            if (!GridUtils.equals(this.robot.getVisualGridPos(), robotIntention))
                promises.push(this.robot.doVisualMove(robotIntention, robotBounce))

            // exécuter toutes les fonctions async en meme temps
            await Promise.all(promises);
        }

        if (this.memory.getGameMode() === "PIGMODE"
            && this.ticksSinceLastModeChange >= 3) {
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
        
        this.scene.modeUpdate();

        if (robotDead) {
            console.warn("DEAD!!!");
            // faire quelque chose !
            this.scene.onRobotDead();
        }
    }

    public async prevTick() {
        this.memory.onPrevTick();
        this.scene.modeUpdate()
        this.level.popEntityState();
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
                        if (!stringArraysEq(this.robot.getCarriedItems(), this.level.getAllItemTypes()))
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