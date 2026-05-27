export class Save {
    private static STORAGE_KEY = "completedLevels";

    static getCompletedLevels(): string[] {
        return JSON.parse(
            sessionStorage.getItem(this.STORAGE_KEY) ?? "[]"
        );
    }

    static completeLevel(levelName: string) {
        const completed = this.getCompletedLevels();

        if (!completed.includes(levelName)) {
            completed.push(levelName);

            sessionStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(completed)
            );
        }
    }

    static isCompleted(levelName: string): boolean {
        return this.getCompletedLevels().includes(levelName);
    }
}