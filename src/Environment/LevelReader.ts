import { BasicBooleenContainer } from "../Containers/BasicBooleenContainer";
import { BasicInstContainer } from "../Containers/BasicInstContainer";
import { ListContainer } from "../Containers/ListContainer";
import { BooleenBrutContainer } from "../Containers/Prefabs/BooleenBrutContainer";
import { EgalContainer } from "../Containers/Prefabs/EgalContainer";
import { EtContainer } from "../Containers/Prefabs/EtContainer";
import { ExeFonctionContainer } from "../Containers/Prefabs/ExeFonctionContainer";
import { FlagContainer } from "../Containers/Prefabs/FlagContainer";
import { FonctionContainer } from "../Containers/Prefabs/FonctionContainer";
import { InfContainer } from "../Containers/Prefabs/InfContainer";
import { MoinsContainer } from "../Containers/Prefabs/MoinsContainer";
import { NotContainer } from "../Containers/Prefabs/NotContainer";
import { OuContainer } from "../Containers/Prefabs/OuContainer";
import { PlusContainer } from "../Containers/Prefabs/PlusContainer";
import { PourContainer } from "../Containers/Prefabs/PourContainer";
import { PrintContainer } from "../Containers/Prefabs/PrintContainer";
import { SiContainer } from "../Containers/Prefabs/SiContainer";
import { SupContainer } from "../Containers/Prefabs/SupContainer";
import { ObstacleSensor } from "../Language/Booleen/ObstacleSensor";
import { MoveBackwardInstuction } from "../Language/Instructions/MoveBackwardInstruction";
import { MoveForwardInstuction } from "../Language/Instructions/MoveForwardInstruction";
import { TurnLeftInstruction } from "../Language/Instructions/TurnLeftInstruction";
import { TurnRightInstruction } from "../Language/Instructions/TurnRightInstruction";
import { CreateVarModal } from "../MRGUI/windows/CreateVarModal";
import { MakeABlockModal } from "../MRGUI/windows/MakeABlockModal";
import type { OutilsBox } from "../MRGUI/OutilsBox";
import type { ExecutionContext, Goal } from "../MainLoop/ExecutionContext";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { ASSETS_ROOT } from "../Shared/Constants";
import type { BooleanBlock, CategoryFactories, InstructionBlock, OpBlock, SensorBlock, StructureBlock } from "../Shared/types";

export const State = { // Proposition, avoir différents symboles pour différetentes orientations : L = robot left, R = robot right etc
    Empty: " ",
    RobotStart: "@",
    Wall: "#",
    Ground: ".",
    Flag: "x",
    GodHimself: "^"
} as const;

export type State = typeof State[keyof typeof State];
export type Map2 = State[][];
export type Map3 = Map2[];
export type IslandMap = Map3[]; // La map d'une ile, c'est la liste des maps de ses feuilles
export type IslandBlockset = string[]; // Chaque ile à son propre blockset, qui est la liste des ses blocs

export type LevelIndexEntry = {name: string, file: string};

export class LevelReader {
    static LEVELS_ROOT = ASSETS_ROOT + "levels/";

    private nb_islands : number = 0;
    private structure : IslandMap[] = [];
    private blockset: IslandBlockset[] = [];
    private blockLimit: (number | null)[] = [];
    private goals: Goal[] = [];

    static async getLevelList(): Promise<LevelIndexEntry[]> {
        const res = await fetch(LevelReader.LEVELS_ROOT + "index.json");
        const data = await res.json();
        return data.levels;
    }

    constructor() {}

    private readLayers(layout: string[]): Map3 {
        return layout.map((layer) => {
                return [...layer].map((line) => {
                    return [...line].map((char) => {
                        if (Object.values(State).includes(char as State)) {
                            return char as State;
                        }
                        return State.Empty;
                    });
                });
            });
    }

    async loadLevel(name: string): Promise<void> {
        try {
            const response = await fetch(LevelReader.LEVELS_ROOT + name);
            if (!response.ok) {
                throw new Error(`cant load level : ${response.statusText}`);
            }
            const data = await response.json();
            const list: any[] = data.islands;
            this.nb_islands = list.length;

            for (const island of list) {
                const leafs: string[][] = island.layouts;
                const map : IslandMap = []
                for (const leaf of leafs) {
                    map.push(this.readLayers(leaf));
                }
                this.structure.push(map);
                this.blockset.push(Object.values(island.blockset).flat() as IslandBlockset);
                if (island.block_limitation)
                    this.blockLimit.push(island.block_limitation);
                else
                    this.blockLimit.push(null);
                
                this.goals.push(island.goal);
            }

            //console.log("json level loaded !");

        } catch (error) {
            console.error("gave up while trying to lead level :", error);
            this.structure = []; 
        }
    }

    public getGoal(nb: number): Goal {
        return this.goals[nb];
    }

    public getIsland(nb:number) : IslandMap {
        return this.structure[nb];
    }

    
    /* Faudra que je bouge les trois du dessous,
    ca fait un peu trop de logique pour juste un LevelReader peut être... */

    private createFactories(ctx: ExecutionContext, scene: GameScene) {
        const instructions: CategoryFactories<InstructionBlock> = {
            forward: (root) =>
            new BasicInstContainer("Avancer d'une case", new MoveForwardInstuction(ctx), root, scene),

            backward: (root) =>
            new BasicInstContainer("Reculer d'une case", new MoveBackwardInstuction(ctx), root, scene),

            left: (root) =>
            new BasicInstContainer("Tourner à gauche", new TurnLeftInstruction(ctx), root, scene),

            right: (root) =>
            new BasicInstContainer("Tourner à droite", new TurnRightInstruction(ctx), root, scene),

            print: (root) =>
            new PrintContainer(root, scene),

        };

        const structures: CategoryFactories<StructureBlock> = {
            for: (root) => {
            const l = new ListContainer(root, scene);
            const pour = new PourContainer(l, root, scene);
            l.addInstruction(pour.getQueue(), 0);
            l.addInstruction(pour.getHeader(), 0);
            l.addStruct(pour);
            return l;
            },

            if: (root) => {
            const l = new ListContainer(root, scene);
            const si = new SiContainer(l, root, scene);
            l.addInstruction(si.getQueue(), 0);
            l.addInstruction(si.getHeader(), 0);
            l.addStruct(si);
            return l;
            },
        };

        const booleans: CategoryFactories<BooleanBlock> = {
            true: (root) => new BooleenBrutContainer(true, root, scene),
            false: (root) => new BooleenBrutContainer(false, root, scene),
            not: (root) => new NotContainer(root, scene),
            and: (root) => new EtContainer(root, scene),
            or: (root) => new OuContainer(root, scene),
            inf: (root) => new InfContainer(root, scene),
            sup: (root) => new SupContainer(root, scene),
            eq: (root) => new EgalContainer(root, scene),
        };

        const sensors: CategoryFactories<SensorBlock> = {
            obstacle: (root) =>
            new BasicBooleenContainer("Il y a un obstacle", new ObstacleSensor(ctx), root, scene),
        };

        const ops: CategoryFactories<OpBlock> = {
            plus: (root) => new PlusContainer(root, scene),
            minus: (root) => new MoinsContainer(root, scene),
        };

        return { instructions, structures, booleans, sensors, ops };
    }

    public setupToolbox(nb : number, tb: OutilsBox, ctx: ExecutionContext, scene: GameScene) {
        const factories = this.createFactories(ctx, scene);

        for (const category in factories) {
            const cat = category as keyof typeof factories;
            for (const block of this.blockset[nb] as any[]) {
                const factory = (factories[cat] as any)[block];
                if (factory) {
                    tb.addTemplate(cat, factory);
                }
            }
        }

        // Bouton var (cas spécial)
        if (this.blockset[nb].includes("var_create")) {
            tb.addButton("variables", "Créer une variable", () => {
                new CreateVarModal(scene.advancedTexture, (name: string) => {
                    tb.addVariable(name, scene);
                });
            });
        }

        // Bouton fonction (cas spécial)
        if (this.blockset[nb].includes("function_create")) {
            tb.addButton("functions", "Créer un bloc de plastique", () => {
                new MakeABlockModal(scene.advancedTexture, (name: string, args: string[]) => {
                    tb.addTemplate("functions", (root) =>
                        new FonctionContainer(name, args, root, scene)
                    );
                    tb.addTemplate("functions", (root) =>
                        new ExeFonctionContainer(name, args.length, root, scene)
                    );
                });
            });
        }

        // Start (cas spécial)
        if (this.blockset[nb].includes("start")) {
            tb.addTemplate("start", (root) => {
                return new FlagContainer(root, scene);
            });
        }

        tb.setBlockLimit(this.blockLimit[nb]);
    }
}