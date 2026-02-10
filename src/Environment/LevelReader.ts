import { ASSETS_ROOT } from "../Shared/Constants";

export const State = {
    Empty: " ",
    RobotStart: "@",
    Wall: "#",
    Ground: "."
} as const;

export type State = typeof State[keyof typeof State];
export type Map2 = State[][];
export type Map3 = Map2[];

export class LevelReader {
    static LEVELS_ROOT = ASSETS_ROOT + "levels/";

    private structure : Map3 = [];

    constructor() {}

    async loadLevel(name: string): Promise<void> {
        try {
            const response = await fetch(LevelReader.LEVELS_ROOT + name);
            if (!response.ok) {
                throw new Error(`cant load level : ${response.statusText}`);
            }
            const data = await response.json();

            const layers: string[] = data.layout;

            this.structure = layers.map((layer) => {
                return [...layer].map((line) => {
                    return [...line].map((char) => {
                        if (Object.values(State).includes(char as State)) {
                            return char as State;
                        }
                        return State.Empty;
                    });
                });
            });

            console.log("json level loaded !");

        } catch (error) {
            console.error("gave up while trying to lead level :", error);
            this.structure = []; 
        }
    }

    public getStructure() : Map3 {
        return this.structure;
    }
}