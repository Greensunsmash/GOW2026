import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { PointerEventTypes } from "@babylonjs/core";
import { InstructionContainer } from "./InstructionContainer";

export class Magnet extends GUI.Rectangle {

    private scene:GameScene;
    private hover:boolean= false;
    private block:boolean = false;
    private blocParent : InstructionContainer;
    //private type : ArgsType;


    constructor(scene:GameScene, parent:InstructionContainer){
        super();
        this.width = "100%";
        this.height = "30px";
        this.isHitTestVisible = false; // Désactive les inputs sur ce control (askip) (non)
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

       public replaceSlot(c:InstructionContainer) : void {
            if (c.isFirstOnly()) return;
            let parent:InstructionContainer | GUI.StackPanel =this.blocParent;
            while (true) {
                if (parent === c) return;
                if (!(parent.parent instanceof InstructionContainer || parent.parent instanceof GUI.StackPanel )) break;
                parent = parent.parent;
            }
            this.blocParent.addNext(c);

        }
    
        // Getters
        public getHover() : boolean {return this.hover;}
        public setHover(bool:boolean) {
            if (this.block) return;
            if (bool) {
                if (this.scene.setHoverSlot(this)) {
                    this.background = "white";
                    this.hover = bool;
                    //console.log("hover :" + this);
                }
            }
            else {
                this.scene.setHoverSlot(null);
                this.background = "#383838";
                this.hover = bool;
            };
        }

        public getBlock():boolean{return this.block;}
        public setBlock(bool:boolean):void {
            if (bool && this.getHover()) this.setHover(false);
            this.block = bool;
        }
}
