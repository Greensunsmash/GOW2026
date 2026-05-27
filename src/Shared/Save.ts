export class Save {
    private static STORAGE_KEY = "completedLevels";

    static getCompletedLevels(): string[] {
        return JSON.parse(
            sessionStorage.getItem(Save.STORAGE_KEY) ?? "[]"
        );
    }

    static completeLevel(levelName: string) {
        const completed = Save.getCompletedLevels();

        if (!completed.includes(levelName)) {
            completed.push(levelName);

            sessionStorage.setItem(
                Save.STORAGE_KEY,
                JSON.stringify(completed)
            );
        }
    }

    static isCompleted(levelName: string): boolean {
        return Save.getCompletedLevels().includes(levelName);
    }

    static reset() {
        sessionStorage.setItem(this.STORAGE_KEY, "[]");
    }
}