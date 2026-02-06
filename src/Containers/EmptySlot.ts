import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { PointerEventTypes } from "@babylonjs/core";
import type { ArgsType, BlocContainer } from "./BlocContainer";

// Cette classe symbolise un slot (de BlocContainer) vide qui peut donc être remplacé
export class EmptySlot extends GUI.Rectangle {

    private scene:GameScene;
    private hover:boolean= false;
    private blocParent : BlocContainer;
    private type : ArgsType;


    constructor(parent:BlocContainer, type:ArgsType) {
        super();
        this.scene = parent.getScene();
        this.type = type;
        this.blocParent = parent;
        this.background = "#383838" ;
        this.cornerRadius = 10 ;
        this.height = "40px";
        this.width = "60px";
        this.alpha = 0.3;
        this.init();
    }

    init():void {
        this.scene.scene.onPointerObservable.add((pointerInfo) => { 
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                if (this.getHover()) {
                    if (!this.contains(evt.x, evt.y)) {
                        this.setHover(false);
                    }
                } else {
                    if (this.contains(evt.x, evt.y)){
                        this.setHover(true);
                    }
                }
            }
        });
    }

    public getHover() : boolean {return this.hover;}
    public setHover(bool:boolean) {
            if (bool) {
                if (this.scene.setHoverSlot(this)) {
                    this.background = "white";
                    this.hover = bool;
                }
            }
            else {
                this.scene.setHoverSlot(null);
                this.background = "#383838";
                this.hover = bool;
            };
        }

    public replaceIfMatch(c:BlocContainer) : void {
        if (this.getType() === c.getType() || (this.getType() === "ALL" && c.getType() !== "NONE")) this.replaceSlot(c);
    }
    private replaceSlot(c:BlocContainer) : void {
        if (this.parent instanceof GUI.Rectangle) this.blocParent.insertControlAt(c, this.parent);
    }

    // Getters
    getType():ArgsType {return this.type;}

}