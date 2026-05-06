import * as GUI from "@babylonjs/gui";
import type { PlayScene } from "../MainLoop/Scene/PlayScene";
import { Vector2, type IPointerEvent } from "@babylonjs/core";

export class WorkSpace extends GUI.Rectangle {
    private readonly scene: PlayScene;
    private readonly root: GUI.Container;
    private readonly content: GUI.Rectangle;
    private width_limit : number;
    private height_limit : number;

    private isPanning : boolean = false;

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

        this.onPointerDownObservable.add((event) => {
            this.isPanning = true;
            this.width_limit = this.widthInPixels / 2; // Visiblement ces valeurs ne marchent pas mais je ne comprends pas pourquoi
            this.height_limit = this.heightInPixels / 2; // La logique est bonne, mais faut trouver le bon ajustement

            console.log(this.width_limit, this.height_limit);

            const decal = this.getLocalCoordinates(new Vector2(event.x, event.y)).subtract(new Vector2(this.content.leftInPixels, this.content.topInPixels));
            const offset = this.getLocalCoordinates(new Vector2(0,0));
            console.log(this.content.leftInPixels, this.content.topInPixels, decal, offset);
            this.scene.scene.onPointerMove = (evt: IPointerEvent) => {
                if (!this.isPanning) return;

                const x_pos = evt.x - decal.x + offset.x; // Pour vérifier de pas trop déplacer sur les cotés
                if (x_pos <= this.width_limit && x_pos + this.content.widthInPixels*this.content.scaleX >= this.width_limit)
                    this.content.leftInPixels = x_pos;

                const y_pos = evt.y - decal.y + offset.y; // Pour vérifier de pas trop déplacer en hauteur
                if (y_pos >= this.height_limit && y_pos + this.content.heightInPixels*this.content.scaleY <= this.height_limit)
                    this.content.topInPixels = y_pos;
                
            };
            this.scene.scene.onPointerUp = () => {
                if (this.isPanning) this.isPanning = false;
            }
        }

        )
    }

    public zoom(x:number) {
        if (x > 0) {
            this.content.scaleX = x+this.content.scaleX > 2 ? 2 : x+this.content.scaleX; 
            this.content.scaleY = x+this.content.scaleY > 2 ? 2 : x+this.content.scaleY;
        } else {
            this.content.scaleX = x+this.content.scaleX > 0.2 ? x+this.content.scaleX : 0.2;
            this.content.scaleY = x+this.content.scaleY > 0.2 ? x+this.content.scaleY : 0.2;
        }
    }

    // GETTERS
    public getContentRoot() : GUI.Rectangle {return this.content;}
}