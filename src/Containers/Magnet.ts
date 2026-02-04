import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { PointerEventTypes } from "@babylonjs/core";
import type { InstructionContainer } from "./InstructionContainer";

export class Magnet extends GUI.Rectangle {

    private scene:GameScene;
    private hover:boolean= false;
    private blocParent : InstructionContainer;
    //private type : ArgsType;


    constructor(scene:GameScene, parent:InstructionContainer){
        super();
        this.width = "100%";
        this.height = "30px";
        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.alpha = 0.3;
        this.background = "#383838";

        this.scene = scene;
        this.blocParent = parent;

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
                this.background = "white";
                this.scene.hoverSlot = this;
            }
            else {
                this.background = "#383838";
                this.scene.hoverSlot = null;
            };
    
            this.hover = bool;
        }
    
        /*
        public replaceIfMatch(c:BlocContainer) : void {
            if (this.getType() === c.getType() || (this.getType() === "ALL" && c.getType() !== "NONE")) this.replaceSlot(c);
        }*/        
       public replaceSlot(c:InstructionContainer) : void {if (this.blocParent !== c) this.blocParent.addNext(c);}
    
        // Getters
        //getType():ArgsType {return this.type;}
}
