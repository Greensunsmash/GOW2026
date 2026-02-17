import * as GUI from "@babylonjs/gui";
import { Scene, Engine, HemisphericLight, Vector3} from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";
import type { Magnet } from "../../Containers/Magnet";
import { AssetLibrary } from "../../Environment/AssetManager";
import { ListContainer } from "../../Containers/ListContainer";

export abstract class GameScene {
    public scene: Scene;
    private hoverSlot : GUI.Rectangle | null = null;
    private dragging : boolean = false;

    protected drh : AssetLibrary;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this.drh = new AssetLibrary(this.scene);
        new HemisphericLight("light", new Vector3(0,1,0), this.scene);
    }

    update(): void {
        //this.player.update();
    }

    render(): void {
        this.scene.render();
    }

    // SETTERS/GETTERS
    public setHoverSlot(c:GUI.Rectangle | null):boolean {
        if (this.hoverSlot) {
            if (c) return false; // C'est de la merde ça
            this.hoverSlot = null;
            return true;
        }
        else {
            if (!c) console.log ("hover en théorie impossible, à comprendre"); // SI si en fait c'est compréhensible et possible mais jsplus pk
            this.hoverSlot = c;
            return true;
        }
    }
    public getHoverSlot(): GUI.Rectangle | null {return this.hoverSlot;}
    public isDragging(): boolean{return this.dragging;}
    public setDragging(bool:boolean) {
        // RAJOUTER A LISTCONTRAINER UN DRAGMODE QUI S4ACTIVE D'ICI, ET PERMET D'AGGRANDIR LE DETECTOR
        if (bool) {
            if (this.hoverSlot instanceof ListContainer) this.hoverSlot.toggleMagnet(true);
        } else {
            if (this.hoverSlot instanceof ListContainer) this.hoverSlot.toggleMagnet(false);
        }
        this.dragging = bool;}

}