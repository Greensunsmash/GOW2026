import * as BABYLON from "babylonjs";

export class SoundManager {

    private static instance: SoundManager | null = null;
    private static instancePromise: Promise<SoundManager> | null = null;

    private muted: boolean = false;
    private previousVolume: number = 1;

    private engine!: BABYLON.AudioEngineV2;

    private currentAmbient: BABYLON.StreamingSound | null = null;

    private constructor() {}

    private async init() {
        this.engine = await BABYLON.CreateAudioEngineAsync();
        await this.engine.unlockAsync();
    }

    public static async get(): Promise<SoundManager> {

        if (this.instance) {
            return this.instance;
        }
        if (this.instancePromise) {
            return this.instancePromise;
        }

        this.instancePromise = (async () => {
            const manager = new SoundManager();
            await manager.init();
            this.instance = manager;
            return manager;
        })();

        return this.instancePromise;
    }

    public static async playAmbient(name: string, loop = true): Promise<void> {

        const manager = await SoundManager.get();

        // stop ancienne musique
        if (manager.currentAmbient) {
            manager.currentAmbient.stop();
            manager.currentAmbient.dispose();
            manager.currentAmbient = null;
        }

        const sound = await BABYLON.CreateStreamingSoundAsync("ambient",`assets/music/${name}`);
        sound.loop = loop;
        sound.play();
        manager.currentAmbient = sound;
    }

    public static async playSound(name: string, volume: number = 1): Promise<void> {

        await SoundManager.get();
        const sound = await BABYLON.CreateSoundAsync(name,`assets/sounds/${name}`);
        sound.volume = volume;
        sound.play();

        // nettoyage automatique une fois terminé
        sound.onEndedObservable.addOnce(() => {
            sound.dispose();
        });
    }

    private static async mute(): Promise<void> {
        const manager = await SoundManager.get();
        manager.previousVolume = manager.engine.volume;
        manager.engine.setVolume(0);
        manager.muted = true;
    }

    private static async unmute(): Promise<void> {
        const manager = await SoundManager.get();
        manager.engine.setVolume(manager.previousVolume);
        manager.muted = false;
    }

    public static async toggleMute(): Promise<boolean> {
        const manager = await SoundManager.get();
        if (manager.muted) await SoundManager.unmute(); 
        else await SoundManager.mute();
        return manager.muted;
    }

    public static async isMuted(): Promise<boolean> {
        const manager = await SoundManager.get();
        return manager.muted;
    }

}