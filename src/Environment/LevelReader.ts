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
import { PickupInstruction } from "../Language/Instructions/PickupInstruction";
import { ItemSensor } from "../Language/Booleen/ItemSensor";
import { TantQueContainer } from "../Containers/Prefabs/TantQueContainer";
import { SinonContainer } from "../Containers/Prefabs/SinonContainer";
import { WaitInstruction } from "../Language/Instructions/WaitInstruction";
import { ObstacleSensorContainer } from "../Containers/Prefabs/ObstacleSensorContainer";
import { ItemSensorContainer } from "../Containers/Prefabs/ItemSensorContainer";
import type { DialogSpeakername } from "../MRGUI/windows/RealDialog";

export const State = { // Proposition, avoir différents symboles pour différetentes orientations : L = robot left, R = robot right etc
    Empty: " ",
    RobotStart: "@",
    Wall: "#",
    Ground: ".",
    Flag: "x",
    GodHimself: "^",
    Item: "!",
    PigLeft: "l",
    PigRight: "r",
    PigUp: "u",
    PigDown: "d",
    SirCEyeInteractor: "o",
    CursedGround: "O",
    Scientifique :"s",
    LeGrandSirC: "C"
} as const;

export type ItemType = typeof State.Item;
export type MobType = typeof State.PigDown | typeof State.PigUp | typeof State.PigLeft | typeof State.PigRight;

export type State = typeof State[keyof typeof State];
export type Map2 = State[][];
export type Map3 = Map2[];
export type IslandMap = Map3[]; // La map d'une ile, c'est la liste des maps de ses feuilles
export type IslandBlockset = string[]; // Chaque ile à son propre blockset, qui est la liste des ses blocs

export type LevelIndexEntry = {name: string, file: string, x?: number, y?: number, worldNo?: number};

export type DialogLine = {speaker: DialogSpeakername, text: string};
type LevelData = {
    islands: {
        layouts: State[][];
        blockset: any;
        block_limitation: number | undefined;
        goal: any;
        begin_dialogs: DialogLine[];
        end_dialogs: DialogLine[];
        clues: string[];
    }[];
};

export class LevelReader {
    static LEVELS_ROOT = ASSETS_ROOT + "levels/";

    private static indexCache: LevelIndexEntry[] | null = null;
    private static levelCache: Map<string, LevelData> = new Map();

    private nb_islands : number = 0;
    private structure : IslandMap[] = [];
    private blockset: IslandBlockset[] = [];
    private clues: string[][] = [];
    private blockLimit: (number | null)[] = [];
    private goals: Goal[][] = [];
    private beginDialogs: (DialogLine[] | null)[] = [];
    private endDialogs: (DialogLine[] | null)[] =  [];
    
    static async init() {
        // Aucune interception d'erreurs, on catch ailleurs

        const fetchLevelList = async (): Promise<LevelIndexEntry[]> => {
            const res = await fetch(LevelReader.LEVELS_ROOT + "index.json");
            //console.log(await res.text());
            const data = await res.json();
            return data.levels;
        } 

        const levelList = await fetchLevelList();
        if (levelList.length <= 0) {
            throw new Error("cannot fill level list: level index (index.json) is empty");
        }
        this.indexCache = levelList;

        const fetchLevel = async (name: string): Promise<LevelData> => {
            const response = await fetch(LevelReader.LEVELS_ROOT + name);
            if (!response.ok) {
                throw new Error(`cant load level : ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        const promises = levelList.map(async (levelEntry: LevelIndexEntry) => {
            const lvl = await fetchLevel(levelEntry.file);
            //console.log("storing in cache" + levelEntry.file);
            this.levelCache?.set(levelEntry.file, lvl);
        });
        await Promise.all(promises);
    }

    static async getLevelList() {
        return this.indexCache;
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

    private reset() {
        this.structure = [];
        this.blockset = [];
        this.blockLimit = [];
        this.goals = [];
        this.beginDialogs = [];
        this.endDialogs = [];
    }

    async loadLevel(name: string): Promise<void> {
        this.reset();
        try {
            const data = LevelReader.levelCache?.get(name);
            if (!data)
                throw new Error(`cant retrieve ${name} from level reader cache`);

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

                this.clues.push(island.clues ?? []);
                
                this.goals.push(island.goal);

                this.beginDialogs.push(island.begin_dialogs || null);
                this.endDialogs.push(island.end_dialogs || null);
            }

            //console.log("json level loaded !");

        } catch (error) {
            console.error("gave up while trying to lead level :", error);
            this.structure = []; 
        }
    }

    public static getWorldNo(file: string): number {
        return LevelReader.indexCache?.find(entry => entry.file === file)?.worldNo ?? 1;
    }

    public getBlockLimitForIsland(nb: number): number | null {
        return this.blockLimit[nb];
    }

    public getGoalsForIsland(nb: number): Goal[] {
        return this.goals[nb];
    }

    public getIsland(nb:number) : IslandMap {
        return this.structure[nb];
    }

    public getBeginDialogs(nb: number): DialogLine[] | null {
        return this.beginDialogs[nb];
    }

    public getEndDialog(nb: number): DialogLine[] | null {
        return this.endDialogs[nb];
    }

    public getClues(nb: number): string[] {
        return this.clues[nb];
    }

    public getAllDialogs(): DialogLine[] {
        const dialogs: DialogLine[] = [];
        for (let i = 0; i < this.nb_islands; i++) {
            const beginDialogs: DialogLine[] | null = this.getBeginDialogs(i);
            if (beginDialogs) dialogs.push(...beginDialogs);
            const endDialogs: DialogLine[] | null = this.getEndDialog(i);
            if (endDialogs) dialogs.push(...endDialogs);
        }
        return dialogs;
    }
    
    /* Faudra que je bouge les trois du dessous,
    ca fait un peu trop de logique pour juste un LevelReader peut être... */

    public createFactories(ctx: ExecutionContext, scene: GameScene) {
        const instructions: CategoryFactories<InstructionBlock> = {
            forward: (root, content_root) =>
            new BasicInstContainer("▲   Avancer d'une case", "forward", new MoveForwardInstuction(ctx),  root, content_root, scene),

            backward: (root, content_root) =>
            new BasicInstContainer("▼   Reculer d'une case", "backward", new MoveBackwardInstuction(ctx), root, content_root, scene, new MoveForwardInstuction(ctx)),

            left: (root, content_root) =>
            new BasicInstContainer("↺   Tourner à gauche", "left", new TurnLeftInstruction(ctx), root, content_root, scene, new MoveForwardInstuction(ctx)),

            right: (root, content_root) =>
            new BasicInstContainer("↻   Tourner à droite", "right", new TurnRightInstruction(ctx), root, content_root, scene, new MoveForwardInstuction(ctx)),

            pickup: (root, content_root) =>
            new BasicInstContainer("↓   Ramasser le débris", "pickup", new PickupInstruction(ctx), root, content_root, scene, new MoveForwardInstuction(ctx)),

            wait: (root, content_root) =>
            new BasicInstContainer("⧗   Attendre", "wait", new WaitInstruction(ctx), root, content_root, scene, new MoveForwardInstuction(ctx)),

            print: (root, content_root) =>
            new PrintContainer(root, content_root, scene),

        };

        const structures: CategoryFactories<StructureBlock> = {
            for: (root, content_root) => {
            const l = new ListContainer(root, content_root, scene);
            const pour = new PourContainer(l, root, content_root, scene);
            l.addInstruction(pour.getQueue(), 0);
            l.addInstruction(pour.getHeader(), 0);
            l.addStruct(pour);
            return l;
            },

            if: (root, content_root) => {
            const l = new ListContainer(root, content_root, scene);
            const si = new SiContainer(l, root, content_root, scene);
            l.addInstruction(si.getQueue(), 0);
            l.addInstruction(si.getHeader(), 0);
            l.addStruct(si);
            return l;
            },

            while: (root, content_root) => {
                const l = new ListContainer(root, content_root, scene);
                const tantque = new TantQueContainer(l, root, content_root, scene);
                l.addInstruction(tantque.getQueue(), 0);
                l.addInstruction(tantque.getHeader(), 0);
                l.addStruct(tantque);
                return l;
            },

            elif: (root, content_root) => {
                const l = new ListContainer(root, content_root, scene);
                const sinon = new SinonContainer(l, root, content_root, scene);
                l.addInstruction(sinon.getQueue(), 0);
                l.addInstruction(sinon.getMid(), 0); // C'est un sinon tout va bien
                l.addInstruction(sinon.getHeader(), 0);
                l.addStruct(sinon);
                return l;
            }
        };

        const booleans: CategoryFactories<BooleanBlock> = {
            true: (root, content_root) => new BooleenBrutContainer(true, root, content_root, scene),
            false: (root, content_root) => new BooleenBrutContainer(false, root, content_root, scene),
            not: (root, content_root) => new NotContainer(root, content_root, scene),
            and: (root, content_root) => new EtContainer(root, content_root, scene),
            or: (root, content_root) => new OuContainer(root, content_root, scene),
            inf: (root, content_root) => new InfContainer(root, content_root, scene),
            sup: (root, content_root) => new SupContainer(root, content_root, scene),
            eq: (root, content_root) => new EgalContainer(root, content_root, scene),
        };

        const sensors: CategoryFactories<SensorBlock> = {
            obstacle: (root, content_root) =>
            new ObstacleSensorContainer(root, content_root, scene, ctx),

            item: (root, content_root) =>
            new ItemSensorContainer(root, content_root, scene, ctx),
        };

        const ops: CategoryFactories<OpBlock> = {
            plus: (root, content_root) => new PlusContainer(root, content_root, scene),
            minus: (root, content_root) => new MoinsContainer(root, content_root, scene),
        };

        return { instructions, structures, booleans, sensors, ops };
    }

    public setupToolbox(nb : number, tb: OutilsBox, ctx: ExecutionContext, scene: GameScene) {
        const factories = this.createFactories(ctx, scene);

        
        // Start (cas spécial)
        if (this.blockset[nb].includes("start")) {
            tb.addTemplate("start", (root, content_root) => {
                return new FlagContainer(root, content_root, scene);
            });
        }

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
                    tb.addVariable(name, scene, ctx);
                });
            });
        }

        // Bouton fonction (cas spécial)
        if (this.blockset[nb].includes("function_create")) {
            tb.addButton("functions", "Créer un bloc de plastique", () => {
                new MakeABlockModal(scene.advancedTexture, (name: string, args: string[]) => {
                    tb.addTemplate("functions", (root, content_root) =>
                        new FonctionContainer(name, args, root, content_root, scene)
                    );
                    tb.addTemplate("functions", (root, content_root) =>
                        new ExeFonctionContainer(name, args.length, root, content_root, scene)
                    );
                });
            });
        }


        tb.setBlockLimit(this.blockLimit[nb]);
        tb.rebuildVariables(scene, ctx);

        tb.finish();
    }
}