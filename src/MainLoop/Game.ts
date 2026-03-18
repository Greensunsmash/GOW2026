import { Engine, ArcRotateCamera, Vector3, Viewport, DefaultLoadingScreen } from "@babylonjs/core";
import { GameScene } from "./Scene/GameScene";
import { PlayScene } from "./Scene/PlayScene";
import { LayerMasks } from "../Shared/Constants";

export class Game {

    private engine: Engine;
    private currentScene : GameScene;

    constructor(canvas: HTMLCanvasElement) {
        DefaultLoadingScreen.DefaultLogoUrl = "/fulltransparent.png";
        DefaultLoadingScreen.DefaultSpinnerUrl = "/marcorobo.png";
        const loading = new DefaultLoadingScreen(canvas, '<span style="font-size: 50px;">1 PAF 2 TAFFES STUDIOS</span><br>PRESENTS');
        this.engine = new Engine(canvas, true);
        this.engine.loadingScreen = loading;
        this.currentScene = new PlayScene(this.engine);

        this.engine.runRenderLoop(() => {
            this.currentScene.update();
            this.currentScene.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }


}