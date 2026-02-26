import * as GUI from "@babylonjs/gui";
import { InstructionContainer } from "./InstructionContainer";
import { Magnet } from "./Magnet";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { Instruction } from "../Language/Instructions/Instruction";
import { PointerEventTypes, Vector2, type IPointerEvent } from "@babylonjs/core";
import type { StructureContainer } from "./StructureContainer";

// La classe qui permet de stocker plusieurs instructions container à la suite
export class ListContainer extends GUI.Rectangle {

    private root : GUI.Container;
    private list : (InstructionContainer | Magnet)[];
    private structureList : StructureContainer[];
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
        this.structureList = [];
        this.isHitTestVisible = false;

        // Il ne faut surtout pas mettre ça sinon ça fonctionne plus mdr je déteste babylonjs
        // Ah bah mtn ça fonctionne hehe
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
                    } else if (scene.isDragging()) {
                        let x = evt.x - this.stack.leftInPixels;
                        let y = evt.y - this.stack.topInPixels;
                        y = this.moveTowards(y, this.magnet.centerY, 5);
                        if (!this.magnet.contains(x, y)) {
                            //console.log("Recalcul");
                            let found = false;
                            for (let i=0; i<this.list.length; i++) {
                                if (this.list[i].contains(x, y)) {this.moveMagnet(this.list.indexOf(this.list[i]));found = true; break;}
                            }
                            if (!found && this.list.indexOf(this.magnet) != this.list.length-1) this.moveMagnet(this.list.length-1);
                        }
                    }
                } else {
                    if (this.detector.contains(evt.x, evt.y)){
                        this.setHover(true);
                    }
                }
            }
        });

        this.detector.onPointerDownObservable.add((pointerInfo) => this.click(pointerInfo.x, pointerInfo.y));

        this.scene.dragListeners.push(() => {
            this.stack.paddingBottom = "15px";
        })

        this.scene.undragListeners.push(() => {
            this.stack.paddingBottom = "0px";
        })
    }

    click(x:number, y:number) {
        let nb:number;
        //console.log("click");
        for (nb=0; nb < this.list.length ; nb++) {
            if (this.list[nb] === this.magnet) continue;
            if (this.list[nb].contains(x, y)) {
                let c = this.list[nb] as InstructionContainer;
                let b = c.isPointHandle(new Vector2(x, y));
                if (b) {
                    b.onPointerDownObservable.notifyObservers(new GUI.Vector2WithInfo(new Vector2(x,y)));
                    break;
                }

                let l : ListContainer;

                
                if (this.scene.getHoverSlot() === this) this.setHover(false);

                if (nb == 0 || (nb == 1 && this.list.indexOf(this.magnet) == 0) ) l = this;
                else {
                    l = new ListContainer(this.root, this.scene);
                    const save = nb;
                    const s2 = this.structureList.filter((x) => x.getQueue() === this.list[nb]);
                    if (s2.length === 1) nb = s2[0].getHeaderID();

                    let s = this.structureList.filter((x) => x.contains(nb));
                    //console.log(s);
                    let toMove : InstructionContainer[] = [];
                    let structToMove : StructureContainer[] = [];
                    
                    if (s.length === 1) { // Si ça n'appartient qu'à une seule structure
                        toMove = this.list.slice(nb, s[0].getQueueID()).filter(
                            (x) => x instanceof InstructionContainer
                        );
                        structToMove = this.structureList.filter((x) => x.getHeaderID() >= nb && x.getQueueID() < s[0].getQueueID());
                    } 
                    else if (s.length > 1) {
                        s.sort((x, y) => y.getHeaderID() - x.getHeaderID());

                        toMove = this.list.slice(nb, s[0].getQueueID()).filter(
                            (x) => x instanceof InstructionContainer
                        );
                        structToMove = this.structureList.filter((x) => x.getHeaderID() >= nb && x.getQueueID() < s[0].getQueueID());
                    } 
                    else { // Si ça n'appartient pas à une structure
                        toMove = this.list.slice(nb).filter(
                            (x) => x instanceof InstructionContainer
                        );
                        structToMove = this.structureList.filter((x) => x.getHeaderID() >= nb );
                    }
                    
                    for (const item of toMove) {
                        this.removeInstruction(item);
                    }
                    for (let i=toMove.length-1; i>= 0; i--) {
                        l.addInstruction(toMove[i], 0);
                    }
                    for (const struct of structToMove) {
                        this.structureList.splice(this.structureList.indexOf(struct), 1);
                        l.addStruct(struct);
                    }
                    l.refreshIdentation();

                    nb = save;
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
                    let gros_q = this.scene.getHoverSlot();
                    if (gros_q instanceof ListContainer && gros_q != l) {
                        gros_q.mergeList(l);
                        this.scene.setDragging(false);
                        l.dispose();
                    } else {
                        this.scene.setDragging(false);
                        l.detector.isHitTestVisible = true;
                    }
                }

                break;

            }
        }

    }

    getIndentation(id:number) {
        let sum = 0;
        for (const structure of this.structureList) {
            //console.log("Struct : ", structure.getHeaderID(), structure.getQueueID());
            if (structure.contains(id)) sum += 20;
        }
        return sum;
    }

    refreshIdentation() {
        for (let i=0; i<this.list.length; i++) { // Ca comprend le magnet mais osef, faudra l régler lui aussi
            this.list[i].paddingLeftInPixels = this.getIndentation(i);
        }
    }

    addStruct(s:StructureContainer) {
        this.structureList.push(s);
        s.setList(this);
    }

    addInstruction(c: InstructionContainer, index : number) {
        if (c.parent) {c.parent.removeControl(c);}
        
        this.list.splice(index, 0, c);
        this.stack.clearControls();
        for (let i=0; i<this.list.length; i++) {
            this.list[i].paddingLeftInPixels = this.getIndentation(i);
            this.stack.addControl(this.list[i]);
        }

    }

    removeInstruction(c:InstructionContainer) {
        if (this.list.length <= 1) return ;
        let nb = this.list.indexOf(c);
        this.stack.removeControl(c);
        this.list.splice(nb, 1);
    }

    moveTowards(current: number, target: number, maxDelta: number): number {
        //console.log("Towards : " + current + target);
        if (Math.abs(target - current) <= maxDelta) {
            //console.log(target)
            return target;
        }
        //console.log( current + Math.sign(target - current) * maxDelta)
        return current + Math.sign(target - current) * maxDelta;
    }

    moveMagnet(id: number) {
        //console.log(id);
        let currentIndex = this.list.indexOf(this.magnet);
        this.list.splice(currentIndex, 1);
        currentIndex = id;
        this.list.splice(currentIndex, 0, this.magnet);
        this.stack.clearControls();
        for (const control of this.list) {
            this.stack.addControl(control);
        }
    }

    getListInstruction() : (Instruction[]) {
        let l = this.list.filter((x:InstructionContainer | Magnet) => x instanceof InstructionContainer);
        return l.map(((x:InstructionContainer) => x.getInstruction()));
    }

    toggleMagnet(bool:boolean) {
        this.magnet.isVisible = bool;
    }

    mergeList(list:ListContainer) {
        if (this === list) return;
        let new_list = list.getList().filter((x)=>x instanceof InstructionContainer);
        let id = this.list.indexOf(this.magnet);

        for (let i=0; i<new_list.length; i++) {
            this.addInstruction(new_list[i], i+id);
        }
        for (const struct of list.structureList) {
            this.addStruct(struct);
        }
        this.refreshIdentation();
        this.root.removeControl(list);
        list.dispose();
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
    getList():(InstructionContainer | Magnet)[]{return this.list;}
    getIdInstruction(i:InstructionContainer) : number{ return this.list.indexOf(i);}

}
