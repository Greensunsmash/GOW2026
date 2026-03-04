import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { PointerEventTypes } from "@babylonjs/core";
import type { ArgsType, BlocContainer } from "./BlocContainer";

// Cette classe symbolise un slot (de BlocContainer) vide qui peut donc être remplacé
export class EmptySlot extends GUI.Rectangle {

    private static nb:number=0
    private id:number;
    private readonly scene:GameScene;
    private readonly blocParent : BlocContainer;
    private readonly type : ArgsType;
    private hover:boolean= false;

    constructor(parent:BlocContainer, type:ArgsType) {
        super();
        this.id = EmptySlot.nb;
        EmptySlot.nb += 1;
        this.scene = parent.getScene();
        this.type = type;
        this.blocParent = parent;
        this.background = "#383838" ;
        this.cornerRadius = 10 ;
        this.height = "40px";
        this.width = "60px";
        this.alpha = 0.3;
        this.isHitTestVisible = true;
        this.init();
    }

    init():void {
        this.scene.scene.onPointerObservable.add((pointerInfo) => { 
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                const contains = this.contains(evt.x, evt.y);
                if (this.getHover()) {
                    if (!contains && this.scene.getHoverSlot() === this) this.scene.setHoverSlot(null);
                } else {
                    if (contains) this.scene.setHoverSlot(this);
                }
            }
        });
    }

    // Remplace si c'est du bon type
    public replaceIfMatch(c:BlocContainer) : void {if (this.getType() === c.getType() || (this.getType() === "ALL" && c.getType() !== "NONE")) this.replaceSlot(c);}
    private replaceSlot(c:BlocContainer) : void {
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
            this.background = "white";
            this.hover = bool;
        } else {
            this.background = "#383838";
            this.hover = bool;
        };
    }

    toSring():string {return "EmptySlot " + this.id.toString();}
}