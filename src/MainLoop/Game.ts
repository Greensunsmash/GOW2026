import { Engine, ArcRotateCamera, Vector3, Viewport } from "@babylonjs/core";
import { GameScene } from "./Scene/GameScene";
import { PlayScene } from "./Scene/PlayScene";
import { LayerMasks } from "../shared";

export class Game {

    private engine: Engine;
    private currentScene : GameScene;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.currentScene = new PlayScene(this.engine);

        const uiCamera = new ArcRotateCamera("uiCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.currentScene.scene);
        uiCamera.layerMask = LayerMasks.UI_ONLY;
        const mapCamera = new ArcRotateCamera("mapCamera", Math.PI/2, Math.PI/3, 10, Vector3.Zero(), this.currentScene.scene);
        mapCamera.viewport = new Viewport(0.5, 0, 0.5, 1.0);
        mapCamera.layerMask = LayerMasks.SCENE_ONLY;
        mapCamera.attachControl(canvas, true);

        this.currentScene.scene.activeCameras = [];
        this.currentScene.scene.activeCameras.push(mapCamera);
        this.currentScene.scene.activeCameras.push(uiCamera);

        this.engine.runRenderLoop(() => {
            this.currentScene.update();
            this.currentScene.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }


}