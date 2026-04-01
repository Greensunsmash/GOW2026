import { Engine, ArcRotateCamera, Vector3, Viewport, DefaultLoadingScreen } from "@babylonjs/core";
import { GameScene } from "./Scene/GameScene";
import { PlayScene } from "./Scene/PlayScene";
import { LayerMasks } from "../Shared/Constants";
import { LevelSelectScene } from "./Scene/LevelSelectScene";
import type { BaseScene } from "./Scene/BaseScene";

export class Game {

    public engine: Engine;
    public currentScene : BaseScene;

    constructor(canvas: HTMLCanvasElement) {
        DefaultLoadingScreen.DefaultLogoUrl = "/fulltransparent.png";
        DefaultLoadingScreen.DefaultSpinnerUrl = "/marcorobo.png";
        const loading = new DefaultLoadingScreen(canvas, '');
        this.engine = new Engine(canvas, true);
        this.engine.loadingScreen = loading;
    }

    static async Create(canvas: HTMLCanvasElement): Promise<Game> {
        const game = new Game(canvas);
        
        //const scene = new PlayScene(game.engine);
        const scene = new LevelSelectScene(game.engine);
        //await scene.init();
        await scene.init(async (levelName: string) => {
            const newScene = new PlayScene(game.engine);
            await newScene.init(levelName);
            game.switchScene(newScene);
        });
        
        game.currentScene = scene;

        game.engine.runRenderLoop(() => {
            game.currentScene.update();
            game.currentScene.scene.render();
        });

        window.addEventListener("resize", () => {
            game.engine.resize();
        });

        return game;
    }

    public async switchScene(scene: GameScene) {
        if (this.currentScene) {
            this.currentScene.scene.dispose();
        }
        // La scene doit deja etre init ici
        this.currentScene = scene;
    }
}