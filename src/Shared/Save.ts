import type { ProgramData } from "./types";

export type IslandSaveData = {
    program: ProgramData;
};

export type LevelSaveData = {
    completed: boolean;
    skipped: boolean;
    islandData: Record<number, IslandSaveData>;
};

export type SaveData = Record<string, LevelSaveData>;

export class Save {
    private static STORAGE_KEY = "levelSaves";

    static getAll(): SaveData {
        const all =  JSON.parse(
            localStorage.getItem(Save.STORAGE_KEY) ?? "{}"
        );
        //console.log("all save data : ", all);
        return all;
    }

    static setAll(data: SaveData) {
        localStorage.setItem(Save.STORAGE_KEY, JSON.stringify(data));
    }

    static getLevel(file: string): LevelSaveData | undefined {
        const data = Save.getAll();
        return data[file];
    }

    static hasLevel(file: string): boolean {
        const data = Save.getAll();
        return !!data[file];
    }

    static setLevel(file: string, level: LevelSaveData) {
        const data = Save.getAll();
        data[file] = level;
        Save.setAll(data);
    }

    static patchLevel(
        file: string,
        patch: Partial<LevelSaveData>
    ) {
        const data = Save.getAll();

        data[file] = {
            completed: false,
            skipped: false,
            islandData: [],
            ...data[file],
            ...patch,
        };

        Save.setAll(data);
    }

    static setLevelValue<K extends keyof LevelSaveData>(
        file: string,
        key: K,
        value: LevelSaveData[K]
    ) {
        const data = Save.getAll();

        if (!data[file]) {
            data[file] = {
                completed: false,
                skipped: false,
                islandData: [],
            };
        }

        data[file][key] = value;
        this.setAll(data);
    }

    static getIslandData(file: string, islandId: number): IslandSaveData | undefined {
        const data = Save.getAll();

        return data[file]?.islandData?.[islandId];
    }

    static setIslandData(
        file: string,
        islandId: number,
        program: ProgramData
    ) {
        const data = Save.getAll();

        data[file] ??= {
            completed: false,
            skipped: false,
            islandData: {},
        };

        data[file].islandData[islandId] = { program };

        Save.setAll(data);
    }

    static completeLevel(file: string) {
        Save.patchLevel(file, { completed: true });
    }

    static isCompleted(file: string): boolean {
        return Save.getLevel(file)?.completed ?? false;
    }

    static getCompletedLevels(): string[] {
        const data = Save.getAll();

        return Object.entries(data)
            .filter(([, level]) => level.completed)
            .map(([file]) => file);
    }

    static reset() {
        localStorage.setItem(Save.STORAGE_KEY, "{}");
    }
}