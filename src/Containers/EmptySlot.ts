import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { Observer, PointerEventTypes, PointerInfo } from "@babylonjs/core";
import type { ArgsType, BlocContainer } from "./BlocContainer";
import { Colors } from "../Shared/Colors";

// Cette classe symbolise un slot (de BlocContainer) vide qui peut donc être remplacé
export class EmptySlot extends GUI.Rectangle {

    private static nb:number=0
    protected id:number;
    protected readonly scene:GameScene;
    private readonly blocParent : BlocContainer;
    private readonly type : ArgsType;
    private hover:boolean= false;
    private pointerObserver: Observer<PointerInfo> | null = null;

    constructor(parent:BlocContainer, type:ArgsType) {
        super();
        this.id = EmptySlot.nb;
        EmptySlot.nb += 1;
        this.scene = parent.getScene();
        this.type = type;
        this.blocParent = parent;
        this.background = Colors.EmptySlot;
        this.cornerRadius = 12;
        this.height = "40px";
        this.width = "60px";
        this.thickness = 2;
        this.color = Colors.EmptySlotOhShitImHavingAStroke;
        this.isHitTestVisible = true;
        this.clipChildren = false;
        this.clipContent = false;
        this.init();
    }

    init(): void {
        this.pointerObserver = this.scene.scene.onPointerObservable.add((pointerInfo) => { 
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                const decal = this.scene.getDecal();
                const contains = this.contains(evt.x + decal.x, evt.y + decal.y);
                if (this.getHover()) {
                    if (!contains && this.scene.getHoverSlot() === this) this.scene.setHoverSlot(null);
                } else {
                    if (contains) this.scene.setHoverSlot(this);
                }
            }
        });
    }

    // Remplace si c'est du bon type
    public replaceIfMatch(c:BlocContainer): void {
        if (this.getType() === c.getType() || (this.getType() === "ALL" && c.getType() !== "NONE")) 
            this.replaceSlot(c);
    } // spece de fou y'avait tout ca sur une seule ligne 
    // /!\ fou
    private replaceSlot(c:BlocContainer): void {
        if (this.parent instanceof GUI.Rectangle) {
            if (this.scene.getHoverSlot() === this) this.scene.setHoverSlot(null); 
            this.blocParent.insertControlAt(c, this.parent);
        }
    }

    // Getters
    getType():ArgsType {return this.type;}
    getHover() : boolean {return this.hover;}
    setHover(bool:boolean) {
        if (bool) {
            this.background = Colors.EmptySlotHover;
            this.hover = bool;
        } else {
            this.background = Colors.EmptySlot;
            this.hover = bool;
        };
    }

    // y'avait écrit "tosring"  on est ou là
    toString():string {return "EmptySlot " + this.id.toString();}

    dispose(): void {
        if (this.pointerObserver) {
            this.scene.scene.onPointerObservable.remove(this.pointerObserver);
            this.pointerObserver = null;
        }
        
        if (this.scene.getHoverSlot() === this) {
            this.scene.setHoverSlot(null);
        }

        super.dispose();
    }
}