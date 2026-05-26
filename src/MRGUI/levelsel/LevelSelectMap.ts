import * as GUI from "@babylonjs/gui";
import type { PlayScene } from "../MainLoop/Scene/PlayScene";
import { Vector2, type IPointerEvent } from "@babylonjs/core";
import { Colors } from "../Shared/Colors";
import type { BaseScene } from "../../MainLoop/Scene/BaseScene";

export class LevelSelectMap extends GUI.Rectangle {
    private readonly scene: BaseScene;
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
        this.background = Colors.BehindWorkbench;
        this.clipChildren = true;
        this.root.addControl(this);

        this.content = new GUI.Rectangle();
        this.content.width = "2000px"; // grand espace de base
        this.content.height = "2000px";
        this.content.background = Colors.Workbench;
        this.content.color = Colors.SecondaryEnseignement;
        this.content.thickness = 16;
        this.content.cornerRadius = 22;
        this.content.shadowOffsetX = 1;
        this.content.shadowOffsetY = 1;
        this.content.shadowBlur = 7;
        this.content.shadowColor = "#00000040";
        this.addControl(this.content);
        this.width_limit = this.content.widthInPixels / 2;
        this.height_limit = this.content.heightInPixels / 2;

        this.onPointerDownObservable.add((event) => {
            this.isPanning = true;

            const decal = this.getLocalCoordinates(new Vector2(event.x, event.y)).subtract(new Vector2(this.content.leftInPixels, this.content.topInPixels));
            const offset = this.getLocalCoordinates(new Vector2(0,0));

            //console.log(this.content.leftInPixels, this.content.topInPixels, decal, offset);
            this.scene.scene.onPointerMove = (evt: IPointerEvent) => {
                if (!this.isPanning) return;

                // En gros BabylonJs a eu un très bonne idée. Si tu resize un container, topInPixels et leftInpixels ne changent pas pour autant
                // Donc il faut se fier a mes variables true_... qui contiennent les vraies coordonées re-calculées
                // Bien sur tout ça c'est à l'intérieur du Canvas, et c'est pas des pixels réels

                const x_pos = evt.x - decal.x + offset.x;
                const true_left = x_pos + (this.content.widthInPixels - this.content.widthInPixels*this.content.scaleX)/2;
                const true_right = x_pos + (this.content.widthInPixels + this.content.widthInPixels*this.content.scaleX)/2;

                // Pour vérifier de pas trop déplacer sur les cotés
                if (true_left <= this.width_limit && true_right >= this.width_limit) this.content.leftInPixels = x_pos;
                else if (true_left > this.width_limit) this.content.leftInPixels = this.width_limit - (this.content.widthInPixels - this.content.widthInPixels*this.content.scaleX)/2;
                else this.content.leftInPixels = this.width_limit - (this.content.widthInPixels + this.content.widthInPixels*this.content.scaleX)/2;

                const y_pos = evt.y - decal.y + offset.y; // Pour vérifier de pas trop déplacer en hauteur
                const true_up = y_pos + (this.content.heightInPixels - this.content.heightInPixels*this.content.scaleY)/2;
                const true_down = y_pos + (this.content.heightInPixels + this.content.heightInPixels*this.content.scaleY)/2;
                if (true_up <= this.height_limit && true_down >= this.height_limit) this.content.topInPixels = y_pos;
                else if (true_up > this.height_limit) this.content.topInPixels = this.height_limit - (this.content.heightInPixels - this.content.heightInPixels*this.content.scaleY)/2;
                else this.content.topInPixels = this.height_limit - (this.content.heightInPixels + this.content.heightInPixels*this.content.scaleY)/2;    
            };

            this.scene.scene.onPointerUp = () => {
                if (this.isPanning) this.isPanning = false;
            }
        }

        )

        const canvas = this.scene.scene.getEngine().getRenderingCanvas();
        canvas?.addEventListener("wheel", (evt) => {
            const x = evt.clientX;
            const y = evt.clientY;
            const measure = this._currentMeasure;
            if (x < measure.left || x > measure.left + measure.width) return;
            if (y < measure.top || y > measure.top + measure.height) return;
            evt.preventDefault();
            const delta = evt.deltaY > 0 ? -0.05 : 0.05;
            this.zoom(delta);
        });
    }

    public zoom(x:number) {
        if (x > 0) {
            this.content.scaleX = Math.min(x + this.content.scaleX, 1.5);
            this.content.scaleY = Math.min(x + this.content.scaleY, 1.5);
        } else {
            this.content.scaleX = Math.max(x+this.content.scaleX, 0.2); 
            this.content.scaleY = Math.max(x+this.content.scaleY, 0.2); 
        }

        // On ajuste la position au cas où

        const true_left = this.content.leftInPixels + (this.content.widthInPixels - this.content.widthInPixels*this.content.scaleX)/2;
        const true_right = this.content.leftInPixels + (this.content.widthInPixels + this.content.widthInPixels*this.content.scaleX)/2;
        const true_up = this.topInPixels + (this.content.heightInPixels - this.content.heightInPixels*this.content.scaleY)/2;
        const true_down = this.topInPixels + (this.content.heightInPixels + this.content.heightInPixels*this.content.scaleY)/2;

        // Pour vérifier de pas trop déplacer sur les cotés
        if (true_left > this.width_limit) this.content.leftInPixels = this.width_limit - (this.content.widthInPixels - this.content.widthInPixels*this.content.scaleX)/2;
        else if (true_right < this.width_limit) this.content.leftInPixels = this.width_limit - (this.content.widthInPixels + this.content.widthInPixels*this.content.scaleX)/2;
        
        if (true_up > this.height_limit) this.content.topInPixels = this.height_limit - (this.content.heightInPixels - this.content.heightInPixels*this.content.scaleY)/2;
        else if (true_down < this.height_limit) this.content.topInPixels = this.height_limit - (this.content.heightInPixels + this.content.heightInPixels*this.content.scaleY)/2;

    }

    // GETTERS
    public getContentRoot() : GUI.Rectangle {return this.content;}
}