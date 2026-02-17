import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import { Magnet } from "./Magnet";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { Instruction } from "../Language/Instructions/Instruction";
import { PointerEventTypes, type IPointerEvent } from "@babylonjs/core";

// La classe qui permet de stocker plusieurs instructions container à la suite
export class ListContainer extends GUI.Rectangle {

    private root : GUI.Container;
    private list : (InstructionContainer | Magnet)[];
    private magnet : Magnet;
    private stack : GUI.StackPanel;
    private detector : GUI.Rectangle;
    private hover : boolean = false;
    private scene : GameScene;
    public isDragging = false;

    constructor(root: GUI.Container, scene: GameScene) {
        super();
        this.root = root;
        this.list = [];
        this.isHitTestVisible = false;

        // Il ne faut surtout pas mettre ça sinon ça fonctionne plus mdr je déteste babylonjs
        this.adaptHeightToChildren = true;
        this.adaptWidthToChildren = true;

        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.stack = new GUI.StackPanel();
        this.stack.adaptWidthToChildren = true;
        this.stack.adaptHeightToChildren = true;
        this.stack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.stack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.stack.isHitTestVisible = false;

        this.detector = new GUI.Rectangle();
        this.detector.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detector.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.detector.height = "100%";
        this.detector.width = "100%";
        this.detector.alpha = 0.1;
        this.detector.isHitTestVisible = true;

        this.scene = scene;

        root.addControl(this);
        this.addControl(this.stack);
        this.addControl(this.detector);

        this.magnet = new Magnet(this.scene, this);
        this.list.push(this.magnet);
        this.stack.addControl(this.magnet);

        this.scene.scene.onPointerObservable.add((pointerInfo) => { 
            if (this.detector.isHitTestVisible && pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                if (this.getHover()) {
                    if (!this.detector.contains(evt.x, evt.y)) {
                        this.setHover(false);
                    }
                } else {
                    if (this.detector.contains(evt.x, evt.y)){
                        this.setHover(true);
                    }
                }
            }
        });

        this.detector.onPointerDownObservable.add((pointerInfo) => this.click(pointerInfo.x, pointerInfo.y));
    }

    click(x:number, y:number) {
        let nb:number;
        //console.log("click");
        for (nb=0; nb < this.list.length ; nb++) {
            if (this.list[nb].contains(x, y)) {
                let l : ListContainer;
                let c = this.list[nb];

                
                if (this.scene.getHoverSlot() === this) this.setHover(false);

                if (nb == 0) l = this;
                else {
                    l = new ListContainer(this.root, this.scene);

                    let i:number;
                    for (i=this.list.length-1; i>=nb; i--) {
                        if (this.list[i] instanceof InstructionContainer) {l.addInstruction(this.list[i], 0); this.removeInstruction(this.list[i]);}
                    }
                }

                l.detector.isHitTestVisible = false;
                this.scene.setDragging(true);
                
                l.isDragging = true;
                let startX = c.leftInPixels + this.leftInPixels;
                let startY = c.topInPixels + this.topInPixels;
                let decalX = startX - x; 
                let decalY = startY - y;

                l.leftInPixels = startX;
                l.topInPixels = startY;

                // On le fait bouger
                this.scene.scene.onPointerMove = (evt:IPointerEvent) => {
                    if (!l.isDragging) return;
                    l.leftInPixels = evt.x + decalX;
                    l.topInPixels = evt.y + decalY;
                }

                // On le relache
                this.scene.scene.onPointerUp = (evt:IPointerEvent) => {
                    l.isDragging = false;
                    this.scene.setDragging(false);
                    l.detector.isHitTestVisible = true;
                }

            }
        }

    }

    addInstruction(c: InstructionContainer, index : number) {
        if (c.parent) {c.parent.removeControl(c);}

        let nb:number;
        let memory : (InstructionContainer | Magnet)[] =[c];
        for (nb=this.list.length-1; nb>=index; nb--) {
            memory.push(this.list[nb]);
            this.stack.removeControl(this.list[nb])
            this.list.pop();
        }
        for (var key in memory) {
            this.stack.addControl(memory[key]);
            this.list.push(memory[key]);
        }

    }

    removeInstruction(c:InstructionContainer) {
        if (this.list.length <= 1) return ;

        let nb = this.list.indexOf(c);
        this.stack.removeControl(c);
        this.list.splice(nb, 1);
    }

    getListInstruction() : (Instruction[]) {
        let l = this.list.filter((x:InstructionContainer | Magnet) => x instanceof InstructionContainer);
        return l.map(((x:InstructionContainer) => x.getInstruction()));
    }

    toggleMagnet(bool:boolean) {
        this.magnet.isVisible = bool;
    }

    // GETTERS
    getHover():boolean{return this.hover;}
    setHover(bool:boolean){
        if (bool) {
            if (this.scene.setHoverSlot(this)) {
                this.detector.background = "white";
                if (this.scene.isDragging()) this.toggleMagnet(true);
                this.hover = bool;
                //console.log("hover");
            }
        } else {
            this.scene.setHoverSlot(null);
            this.detector.background = "#383838";
            this.toggleMagnet(false);
            this.hover = bool;
            //console.log("unhover");
        };
    }
    getScene():GameScene{return this.scene;}
}
