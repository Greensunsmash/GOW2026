import { Engine, ArcRotateCamera, Vector3, Viewport } from "@babylonjs/core";
import { GameScene } from "./Scene/GameScene";
import { PlayScene } from "./Scene/PlayScene";

export class Game {

    private engine: Engine;
    private currentScene : GameScene;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.currentScene = new PlayScene(this.engine);

        const uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.currentScene.scene);
        uiCamera.attachControl(canvas, true);
        const mapCamera = new ArcRotateCamera("mapCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.currentScene.scene);
        mapCamera.viewport = new Viewport(0.5, 0, 0.5, 1.0);

        this.engine.runRenderLoop(() => {
            this.currentScene.update();
            this.currentScene.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.engine.runRenderLoop(() => {
            this.currentScene.render();
        });


        window.addEventListener("resize", () => this.engine.resize());
    }


}