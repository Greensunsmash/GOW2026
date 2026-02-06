export const State = {
    Empty: " ",
    RobotStart: "@",
    Wall: "#"
} as const;

export type State = typeof State[keyof typeof State];
export type Map2 = State[][];

export class LevelReader {
    private structure : Map2;
    private readonly lines = [
        "#####",
        "# @ #",
        "#####"
    ];

    constructor() {
        this.structure = this.lines.map((line) => {
            return [...line].map((char) => {
                return char as State;
            });
        }); 
    }

    public getStructure() : Map2 {
        return this.structure;
    }
}