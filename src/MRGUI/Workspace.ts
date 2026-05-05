import * as GUI from "@babylonjs/gui";
import type { PlayScene } from "../MainLoop/Scene/PlayScene";

export class WorkSpace extends GUI.Rectangle {
    private readonly scene: PlayScene;
    private readonly root: GUI.Container;
    private readonly content: GUI.Rectangle;

    constructor(root:GUI.Container, scene:PlayScene) {
        super();
        this.scene = scene;
        this.root = root;
        
        this.width = "60%";
        this.height = "100%";
        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.background = "#101010";
        this.thickness = 1;
        this.clipChildren = true;
        this.root.addControl(this);

        this.content = new GUI.Rectangle();
        this.content.width = "2000px"; // grand espace de base
        this.content.height = "2000px";
        this.content.background = "#31138bff";
        this.addControl(this.content);
    }
    

    public zoom(x:number) {this.content.scaleX += x; this.content.scaleY += x;}

    // GETTERS
    public getContentRoot() : GUI.Rectangle {return this.content;}
}