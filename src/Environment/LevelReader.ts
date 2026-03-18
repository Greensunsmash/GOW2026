import type { Container } from "@babylonjs/gui";
import type { OutilsBox } from "../MRGUI/OutilsBox";
import { ASSETS_ROOT } from "../Shared/Constants";
import type { BooleanBlock, CategoryFactories, ExecutionContext, InstructionBlock, SensorBlock, StructureBlock, VariableBlock } from "../Shared/types";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BasicInstContainer } from "../Containers/BasicInstContainer";
import { MoveForwardInstuction } from "../Language/Instructions/MoveForwardInstruction";
import { MoinsContainer } from "../Containers/Prefabs/MoinsContainer";
import { PlusContainer } from "../Containers/Prefabs/PlusContainer";
import { VarValueContainer } from "../Containers/Prefabs/VarValueContainer";
import { ObstacleSensor } from "../Language/Booleen/ObstacleSensor";
import { BasicBooleenContainer } from "../Containers/BasicBooleenContainer";
import { EgalContainer } from "../Containers/Prefabs/EgalContainer";
import { SupContainer } from "../Containers/Prefabs/SupContainer";
import { InfContainer } from "../Containers/Prefabs/InfContainer";
import { OuContainer } from "../Containers/Prefabs/OuContainer";
import { EtContainer } from "../Containers/Prefabs/EtContainer";
import { NotContainer } from "../Containers/Prefabs/NotContainer";
import { BooleenBrutContainer } from "../Containers/Prefabs/BooleenBrutContainer";
import { PourContainer } from "../Containers/Prefabs/PourContainer";
import { ListContainer } from "../Containers/ListContainer";
import { SiContainer } from "../Containers/Prefabs/SiContainer";
import { SetVarContainer } from "../Containers/Prefabs/SetVarContainer";
import { PrintContainer } from "../Containers/Prefabs/PrintContainer";
import { TurnRightInstruction } from "../Language/Instructions/TurnRightInstruction";
import { TurnLeftInstruction } from "../Language/Instructions/TurnLeftInstruction";
import { MoveBackwardInstuction } from "../Language/Instructions/MoveBackwardInstruction";
import { FlagContainer } from "../Containers/Prefabs/FlagContainer";
import { MakeABlockModal } from "../MRGUI/MakeABlockModal";
import { FonctionContainer } from "../Containers/Prefabs/FonctionContainer";
import { ExeFonctionContainer } from "../Containers/Prefabs/ExeFonctionContainer";
import { CreateVarModal } from "../MRGUI/CreateVarModal";

export const State = {
    Empty: " ",
    RobotStart: "@",
    Wall: "#",
    Ground: ".",
    GodHimself: "^"
} as const;

export type State = typeof State[keyof typeof State];
export type Map2 = State[][];
export type Map3 = Map2[];

export class LevelReader {
    static LEVELS_ROOT = ASSETS_ROOT + "levels/";

    private structure : Map3 = [];
    private blockset: string[] = [];

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

            const layers: string[] = data.layout;

            this.structure = this.readLayers(layers);
            this.blockset = Object.values(data.blockset).flat() as string[];

            //console.log("json level loaded !");

        } catch (error) {
            console.error("gave up while trying to lead level :", error);
            this.structure = []; 
        }
    }

    public getStructure() : Map3 {
        return this.structure;
    }

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

        const variables: CategoryFactories<VariableBlock> = {
            plus: (root) => new PlusContainer(root, scene),
            minus: (root) => new MoinsContainer(root, scene),
        };

        return { instructions, structures, booleans, sensors, variables };
    }

    public setupToolbox(tb: OutilsBox, ctx: ExecutionContext, scene: GameScene) {
        const factories = this.createFactories(ctx, scene);

        for (const category in factories) {
            const cat = category as keyof typeof factories;

            for (const block of this.blockset as any[]) {
                const factory = factories[cat][block as any];

                if (factory) {
                    tb.addTemplate(cat, factory);
                }
            }
        }

        // Bouton var (cas spécial)
        if (this.blockset.includes("var_create")) {
            tb.addButton("variables", "Créer une variable", () => {
                new CreateVarModal(scene.advancedTexture, (name: string) => {
                    tb.addTemplate("variables", (root) =>
                        new VarValueContainer(name, root, scene)
                    );
                    tb.addTemplate("variables", (root) =>
                        new SetVarContainer(name, root, scene)
                    );
                });
            });
        }

        // Bouton fonction (cas spécial)
        if (this.blockset.includes("function_create")) {
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
        if (this.blockset.includes("start")) {
            tb.addTemplate("start", (root) => {
                if (scene.getGroupToRun()) return undefined;
                return new FlagContainer(root, scene);
            });
        }
    }
}