import * as BABYLON from "babylonjs";
import { ASSETS_ROOT } from "../Shared/Constants";

type sound = [string, number];
type MusicDictionary = Record<string, sound[]>;

export class SoundManager {

    private static instance: SoundManager | null = null;
    private static instancePromise: Promise<SoundManager> | null = null;

    private music_list : MusicDictionary;
    private sound_list : MusicDictionary;

    private muted: boolean = false;
    private previousVolume: number = 1;

    private engine!: BABYLON.AudioEngineV2;

    private currentAmbient: BABYLON.StreamingSound | null = null;

    private constructor() {}

    public async init() {
        this.music_list = await this.loadMusicDictionary("music/music.json");
        this.sound_list = await this.loadMusicDictionary("sounds/sound.json");

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
            this.instance = manager;
            return manager;
        })();

        return this.instancePromise;
    }

    // Load les musiques associées
    public async loadMusicDictionary(name:string): Promise<MusicDictionary> {
        const response = await fetch(ASSETS_ROOT + name);

        if (!response.ok) {
            throw new Error(`Impossible de charger le fichier : ${name}`);
        }

        const data = await response.json();

        return data as MusicDictionary;
    }

    public static async playAmbient(name: string, loop = true): Promise<void> {

        const manager = await SoundManager.get();

        if (!manager.engine) {return;}

        const variants = manager.music_list[name];

        if (!variants || variants.length == 0) {
            console.log(variants);
            console.warn(`Son inconnu : ${name}`);
            return;
        }

        const sound_info = variants[Math.floor(Math.random() * variants.length)];

        if (sound_info[0] == "null") return;
        
        // stop ancienne musique
        if (manager.currentAmbient) {
            manager.currentAmbient.stop();
            manager.currentAmbient.dispose();
            manager.currentAmbient = null;
        }

        const sound = await BABYLON.CreateStreamingSoundAsync("ambient",`assets/music/${sound_info[0]}`);
        sound.loop = loop;
        sound.setVolume(sound_info[1]);

        return new Promise<void>((resolve) => {
            if (!loop) {
                if (sound.onEndedObservable) {
                    sound.onEndedObservable.addOnce(() => {
                        resolve(); // La promesse se termine ici !
                    });
                } else if ('onended' in sound || (sound as any).onended !== undefined) {
                    (sound as any).onended = () => {
                        resolve(); // La promesse se termine ici !
                    };
                } else {
                    // Au cas où le moteur audio bug, on débloque quand même
                    resolve();
                }
            } else {
                // Si c'est en boucle, pas d'attente de fin
                resolve();
            }

            sound.play();
            manager.currentAmbient = sound;
        });
    }

    public static async playSound(name: string): Promise<void> {

        const manager = await SoundManager.get();
        if (!manager.engine) return;

        const variants = manager.sound_list[name];

        if (!variants || variants.length == 0) {
            console.warn(`Son inconnu : ${name}`);
            return;
        }

        const sound_info = variants[Math.floor(Math.random() * variants.length)];

        if (sound_info[0] == "null") return;
        const sound = await BABYLON.CreateSoundAsync(name,`assets/sounds/${sound_info[0]}`);
        sound.volume = sound_info[1];
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
        if (!manager.engine) await manager.init();
        if (manager.muted) await SoundManager.unmute(); 
        else await SoundManager.mute();
        return manager.muted;
    }

    public static async isMuted(): Promise<boolean> {
        const manager = await SoundManager.get();
        return manager.muted;
    }

}