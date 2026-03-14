import { Engine, Scene } from "@babylonjs/core";
import { EmptySlot } from "../../Containers/EmptySlot";
import { ListContainer } from "../../Containers/ListContainer";
import { AssetLibrary } from "../../Shared/AssetLibrary";
import { OutilsBox } from "../../Containers/OutilsBox";
import { AdvancedDynamicTexture, Control, Rectangle } from "@babylonjs/gui";
import { LayerMasks } from "../../Shared/Constants";
import type { FlagContainer } from "../../Containers/Prefabs/FlagContainer";

export abstract class GameScene {
    public scene: Scene;
    private hoverSlot : EmptySlot | null = null;
    private hoverList : ListContainer | null = null;
    private dragging : boolean = false;
    public dragListeners : (() => void)[];
    public undragListeners : (() => void)[];

    protected advancedTexture: AdvancedDynamicTexture;
    protected leftPanel: Rectangle;

    protected toolbox: OutilsBox;

    protected _drh : AssetLibrary;
    protected _isLoaded : boolean = false;

    protected groupToRun?: ListContainer;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        this._drh = new AssetLibrary(this.scene);
        this.dragListeners = [];
        this.undragListeners = [];
        //new HemisphericLight("light", new Vector3(0,1,0), this.scene);

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        if (this.advancedTexture.layer) {
            this.advancedTexture.layer.layerMask = LayerMasks.UI_ONLY;
        }   

        this.leftPanel = new Rectangle();
        this.leftPanel.width = "50%";
        this.leftPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.leftPanel.background = "#222222"; // Couleur de fond pour bien séparer
        this.advancedTexture.addControl(this.leftPanel);
        
        this.toolbox = new OutilsBox(this.leftPanel, this);

    }


    update(): void {
        //this.player.update();
    }

    render(): void {
        if (this._isLoaded) this.scene.render();
    }

    // SETTERS/GETTERS
    public setHoverSlot(c: EmptySlot | null): boolean {
        if (c === null) {
            this.hoverSlot?.setHover(false);
            this.hoverSlot = null;
            //console.log("HoverSlot : ", null);
            return true;
        }
        if (this.hoverSlot === c) {
            return true;
        }
        this.hoverSlot?.setHover(false);
        this.hoverSlot = c;
        this.hoverSlot.setHover(true);
        //console.log("HoverSlot : ", c.toString());
        return true;
    }
    public getHoverSlot(): EmptySlot | null {return this.hoverSlot;}

    public setHoverList(c: ListContainer | null) : boolean {
        if (c === null) {
            this.hoverList?.setHover(false);
            this.hoverList = null;
            //console.log("HoverList : ", null);
            return true;
        }
        if (this.hoverList === c) {
            return true;
        }
        this.hoverList?.setHover(false);
        this.hoverList = c;
        this.hoverList.setHover(true);
        //console.log("HoverList : ", c.toString());
        return true;
    }
    public getHoverList():ListContainer | null {return this.hoverList;}

    public isDragging(): boolean{return this.dragging;}
    public setDragging(bool:boolean) {
        if (bool) {
            for (let i = 0; i<this.dragListeners.length; i++) {
                this.dragListeners[i]();
            }
            if (this.hoverList instanceof ListContainer) this.hoverList.toggleMagnet(true);
        } else if (this.dragging) {
            for (let i = 0; i<this.undragListeners.length; i++) {
                this.undragListeners[i]();
            }
            if (this.hoverList instanceof ListContainer) this.hoverList.toggleMagnet(false);
        }
        this.dragging = bool;
    }

    
    getToolbox() {
        return this.toolbox;
    }

    
    setGroupToRun(l: ListContainer) {
        this.groupToRun = l;
    }

    removeGroupToRun() {
        this.groupToRun = undefined;
    }
    
    run() {
        if (!this.groupToRun) {
            console.error("trying to run without any flag container");
            return;
        }

        this.groupToRun.getInstructionGroup();
    }
}