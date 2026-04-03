import { Engine, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Rectangle } from "@babylonjs/gui";
import { EmptySlot } from "../../Containers/EmptySlot";
import { ListContainer } from "../../Containers/ListContainer";
import { OutilsBox } from "../../MRGUI/OutilsBox";
import { AssetLibrary } from "../../Shared/AssetLibrary";
import { LayerMasks } from "../../Shared/Constants";
import { Memory } from "../../Language/Memory";
import { FlagContainer } from "../../Containers/Prefabs/FlagContainer";
import type { Level } from "../../Environment/Level";
import { BaseScene } from "./BaseScene";
import { Instruction } from "../../Language/Instructions/Instruction";
import { InstructionContainer } from "../../Containers/InstructionContainer";
import { BlocContainer } from "../../Containers/BlocContainer";

export abstract class GameScene extends BaseScene {
    private hoverSlot : EmptySlot | null = null;
    private hoverList : ListContainer | null = null;
    private dragging : boolean = false;
    public dragListeners : (() => void)[];
    public undragListeners : (() => void)[];
    public blockCount: number = 0;
    protected leftPanel: Rectangle;

    protected toolbox: OutilsBox;

    protected level : Level;

    protected _drh : AssetLibrary;
    protected _isLoaded : boolean = false;

    constructor(engine: Engine) {
        super(engine);

        this._drh = new AssetLibrary(this.scene);
        this.dragListeners = [];
        this.undragListeners = [];

        this.leftPanel = new Rectangle();
        this.leftPanel.width = "50%";
        this.leftPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.leftPanel.background = "#222222"; // Couleur de fond pour bien séparer
        this.advancedTexture.addControl(this.leftPanel);
        
        this.toolbox = new OutilsBox(this.leftPanel, this);
    }

    init(): void {}

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
    
    run() {
        Memory.get().clear();
        this.level.reinitLevel();
        let child_list = this.leftPanel.children;
        let start_block : ListContainer | undefined;

        for (const child of child_list) {
            if (child instanceof ListContainer) {
                if (!child.isFirst()) continue;
                if (child.getFirst() instanceof FlagContainer) start_block = child;
                else if (!child.getInstructionGroup()?.onLaunch()) throw new Error("error 404 Il y a eu une erreur au lancement");
            }
        }

        if (start_block) {
            const grp = start_block.getInstructionGroup();
            if (grp && grp.onLaunch()) grp.execute([]);
            else throw new Error("error 406 Il y a eu une erreur au lancement");
        }

        console.log(Memory.get().getHistory());
    }
}