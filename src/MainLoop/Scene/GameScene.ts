import { Engine, Scene } from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";
import type { Magnet } from "../../Containers/Magnet";
import { AssetLibrary } from "../../Shared/AssetLibrary";

export abstract class GameScene {
    public scene: Scene;
    private hoverSlot : EmptySlot | Magnet | null = null;

    protected _drh : AssetLibrary;
    protected _isLoaded : boolean = false;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this._drh = new AssetLibrary(this.scene);
    }


    update(): void {
        //this.player.update();
    }

    render(): void {
        if (this._isLoaded) this.scene.render();
    }

    // SETTERS/GETTERS
    public setHoverSlot(c:EmptySlot | Magnet | null):boolean {
        if (this.hoverSlot) {
            if (c) return false; // C'est de la merde ça
            this.hoverSlot = null;
            return true;
        }
        else {
            if (!c) console.log ("hover en théorie impossible, à comprendre"); // SI si en fait c'est compréhensible et possible
            this.hoverSlot = c;
            return true;
        }
    }
    public getHoverSlot():EmptySlot | Magnet | null {return this.hoverSlot;}

}