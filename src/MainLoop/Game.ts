import { Engine, ArcRotateCamera, Vector3, Viewport, DefaultLoadingScreen } from "@babylonjs/core";
import { GameScene } from "./Scene/GameScene";
import { PlayScene } from "./Scene/PlayScene";
import { LayerMasks } from "../Shared/Constants";
import { LevelSelectScene } from "./Scene/LevelSelectScene";
import type { BaseScene } from "./Scene/BaseScene";
import { LevelReader } from "../Environment/LevelReader";

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

    /*
    On peut pas rendre de constructeur async,
    du coup de ce que j'ai compris,
    faut créer un async Create et du coup on fait await game.Create au lieu de new Game
    Comme ça on est sur que ce chenapan attend !
    */
    static async Create(canvas: HTMLCanvasElement): Promise<Game> {
        const game = new Game(canvas);
        game.engine.displayLoadingUI();
        
        await LevelReader.init();
        await game.switchToLevelSelect();

        game.engine.runRenderLoop(() => {
            game.currentScene.update();
            game.currentScene.scene.render();
        });

        let resizeTimeout: any;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                game.engine.resize();
            }, 100);
        });

        game.engine.hideLoadingUI();
        return game;
    }

    public async switchToLevelSelect() {
        const scene = new LevelSelectScene(this.engine);
        await this.switchScene(scene);
        //await scene.init();
        await scene.init(
            async (levelName: string) => {
                const newScene = new PlayScene(this.engine);
                await newScene.init(
                    levelName,
                    () => {
                        this.switchToLevelSelect();
                    },
                    () => {
                        this.switchToLevelSelect();
                    }
                );
                await this.switchScene(newScene);
            }
        );
    }

    public async switchScene(scene: BaseScene) {
        if (this.currentScene) {
            this.currentScene.scene.dispose();
        }
        // La scene doit deja etre init ici
        this.currentScene = scene;
    }
}