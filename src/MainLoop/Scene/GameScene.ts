import { Engine, Scene } from "@babylonjs/core";
import type { EmptySlot } from "../../Containers/EmptySlot";
import type { Magnet } from "../../Containers/Magnet";
import { AssetLibrary } from "../../Shared/AssetLibrary";
import { ListContainer } from "../../Containers/ListContainer";

export abstract class GameScene {
    public scene: Scene;
    private hoverSlot : GUI.Rectangle | null = null;
    private dragging : boolean = false;
    public dragListeners : (() => void)[];
    public undragListeners : (() => void)[];


    protected _drh : AssetLibrary;
    protected _isLoaded : boolean = false;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this._drh = new AssetLibrary(this.scene);
        this.dragListeners = []
        this.undragListeners = []
        //new HemisphericLight("light", new Vector3(0,1,0), this.scene);
    }


    update(): void {
        //this.player.update();
    }

    render(): void {
        if (this._isLoaded) this.scene.render();
    }

    // SETTERS/GETTERS
    public setHoverSlot(c: GUI.Rectangle | null): boolean {
        if (c === null) {
            this.hoverSlot = null;
            return true;
        }
        if (this.hoverSlot === c) {
            return true;
        }
        this.hoverSlot = c;
        return true;
    }
    public getHoverSlot(): GUI.Rectangle | null {return this.hoverSlot;}
    public isDragging(): boolean{return this.dragging;}
    public setDragging(bool:boolean) {
        if (bool) {
            for (let i = 0; i<this.dragListeners.length; i++) {
                this.dragListeners[i]();
            }
            if (this.hoverSlot instanceof ListContainer) this.hoverSlot.toggleMagnet(true);
        } else {
            for (let i = 0; i<this.undragListeners.length; i++) {
                this.undragListeners[i]();
            }
            if (this.hoverSlot instanceof ListContainer) this.hoverSlot.toggleMagnet(false);
        }
        this.dragging = bool;
    }

}