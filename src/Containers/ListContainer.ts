import * as BABYLON from "@babylonjs/core";
import { PointerEventTypes, Vector2, type IPointerEvent } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import type { Executable } from "../Language/Executable";
import { Instruction } from "../Language/Instructions/Instruction";
import type { Launchable } from "../Language/Launchable";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { DepartContainer } from "./DepartContainer";
import { InstructionContainer } from "./InstructionContainer";
import { Magnet } from "./Magnet";
import { FlagContainer } from "./Prefabs/FlagContainer";
import type { StructureContainer } from "./StructureContainer";
import { Flag } from "../Language/Group/Depart/Flag";

// La classe qui permet de stocker plusieurs instructions container à la suite
// WARNING : Une instruction ne peut être seule et doit toujours être contenue dans un ListContainer
export class ListContainer extends GUI.Rectangle {

    private static count = 0;
    private readonly id : number;
    private readonly root : GUI.Container;
    private readonly scene : GameScene;
    private readonly stack : GUI.StackPanel;
    private readonly magnet : Magnet;
    private pointerObserver: BABYLON.Observer<BABYLON.PointerInfo>;
    private keyboardObserver: BABYLON.Observer<BABYLON.KeyboardInfo>;
    private readonly detector : GUI.Rectangle;
    private readonly list : (InstructionContainer | Magnet)[];
    private readonly structureList : StructureContainer[];
    private hover : boolean = false;
    public isDragging = false;

    constructor(root: GUI.Container, scene: GameScene) {
        super();
        this.id = ListContainer.count;
        ListContainer.count += 1;
        this.root = root;
        this.list = [];
        this.structureList = [];
        this.isHitTestVisible = false;

        // Il ne faut surtout pas mettre ça sinon ça fonctionne plus mdr je déteste babylonjs
        // Ah bah mtn ça fonctionne hehe
        // bien joué 
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

        // Même moi j'y comprends rien
        this.pointerObserver = this.scene.scene.onPointerObservable.add((pointerInfo) => { 
            if (this.detector.isHitTestVisible && pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                if (this.getHover()) {
                    if (!this.detector.contains(evt.x, evt.y) && this.scene.getHoverList() === this) {
                        this.scene.setHoverList(null);
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
                        this.scene.setHoverList(this);
                    }
                }
            }
        });

        this.detector.onPointerDownObservable.add((pointerInfo) => this.click(pointerInfo.x, pointerInfo.y));


        this.scene.dragListeners.push(() => {this.stack.paddingBottom = "15px";});
        this.scene.undragListeners.push(() => {this.stack.paddingBottom = "0px";});

        // TEMPORAIRE, POUR DECLENCHER LE LANCEMENT
        this.keyboardObserver = scene.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                if (kbInfo.event.key === "a" || kbInfo.event.key === "A") {
                    this.getInstructionGroup();
                }
            }
        });
    }

    // Appelé lorsque qu'on appuie dessus, pour démarrer le drag
    click(x:number, y:number, forceStart?: boolean) {
        let nb:number;
        //console.log("click");
        for (nb=0; nb < this.list.length ; nb++) {
            if (this.list[nb] === this.magnet) continue;
            // Sélectionne sur quel bloc on appuie
            /*
            console.log("list + " + nb + " lipx " + this.list[nb].leftInPixels);
            console.log("list + " + nb + " tipx " + this.list[nb].topInPixels);
            console.log("list + " + nb + "  w  " + this.list[nb].widthInPixels);
            console.log("list + " + nb + "  h  " + this.list[nb].heightInPixels);*/
            if (this.list[nb].contains(x, y) || forceStart) {
                //console.log("past 2/double wesh");
                let c = this.list[nb] as InstructionContainer;

                // Si jamais on a appuyé sur un Valeur/BooleenContainer, on lui transmet le drag
                let b = c.isPointHandle(new Vector2(x, y));
                if (b) {
                    b.onPointerDownObservable.notifyObservers(new GUI.Vector2WithInfo(new Vector2(x,y)));
                    break;
                }


                let l : ListContainer;
                if (this.scene.getHoverList() === this) this.scene.setHoverList(null);

                if (nb == 0 || (nb == 1 && this.list.indexOf(this.magnet) == 0) ) {// On a pris le premier bloc, donc on déplace tout
                    l = this;
                    this.parent?.removeControl(this);
                    this.root.addControl(this);
                }
                else { // Sinon, il va falloir séparer en 2
                    l = new ListContainer(this.root, this.scene);

                    // Si on a cliqué sur la fin d'une structure, alors c'est comme si c'était le début de cette structure
                    const save = nb;
                    const s2 = this.structureList.filter((x) => x.getQueue() === this.list[nb]);
                    if (s2.length === 1) nb = s2[0].getHeaderID();

                    let s = this.structureList.filter((x) => x.contains(nb));
                    let toMove : InstructionContainer[] = []; // Les blocs qu'on va déplacer
                    let structToMove : StructureContainer[] = []; // Les structures qu'on va déplacer
                    
                    if (s.length === 1) { // Si le bloc n'appartient qu'à une seule structure
                        toMove = this.list.slice(nb, s[0].getQueueID()).filter(
                            (x) => x instanceof InstructionContainer
                        );
                        structToMove = this.structureList.filter((x) => x.getHeaderID() >= nb && x.getQueueID() < s[0].getQueueID());
                    } 
                    else if (s.length > 1) { // Si le bloc appartient à plusieurs structure, on choisit la bonne
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
                    
                    // Et maintenant on déplace tout
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

                //console.error("bip boup");
                // On setup le drag
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
                this.scene.scene.onPointerUp = (_evt:IPointerEvent) => {
                    const toolbox = this.scene.getToolbox();
                    if (l.isDragging && toolbox.contains(_evt.x, _evt.y)) {
                            l.parent?.removeControl(l);
                            l.isDragging = false;
                            l.dispose();
                            this.scene.setDragging(false);
                            return;
                    }
                    l.isDragging = false;
                    let gros_q = this.scene.getHoverList();
                    if (gros_q instanceof ListContainer && gros_q != l) {
                        if ((gros_q.getMagnetID() === 0 && !gros_q.isFirst()) || (gros_q.getMagnetID()>0 && !l.isFirst())) {
                            gros_q.mergeList(l);
                            this.scene.setDragging(false);
                            l.dispose();
                        } else {
                            this.scene.setDragging(false);
                            l.detector.isHitTestVisible = true;
                        }
                    } else {
                        this.scene.setDragging(false);
                        l.detector.isHitTestVisible = true;
                    }
                }
                break;

            }
        }

    }

    // Renvoie l'indentation d'un bloc, basé sur son index
    getIndentation(id:number) {
        let sum = 0;
        for (const structure of this.structureList) {
            //console.log("Struct : ", structure.getHeaderID(), structure.getQueueID());
            if (structure.contains(id)) sum += 20;
        }
        return sum;
    }

    // Mets à jour l'indentation de tous les blocs
    refreshIdentation() {
        for (let i=0; i<this.list.length; i++) { // Ca comprend le magnet mais osef, faudra l régler lui aussi
            this.list[i].paddingLeftInPixels = this.getIndentation(i);
        }
    }

    addStruct(s:StructureContainer) {
        this.structureList.push(s);
        s.setList(this);
        this.refreshIdentation();
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
        if (Math.abs(target - current) <= maxDelta) {
            return target;
        }
        return current + Math.sign(target - current) * maxDelta;
    }

    // Sert à déplacer le magnet au bon endroit pour suivre le curseur
    moveMagnet(id: number) {
        let currentIndex = this.list.indexOf(this.magnet);
        this.list.splice(currentIndex, 1);
        currentIndex = id;
        this.list.splice(currentIndex, 0, this.magnet);
        this.stack.clearControls();
        for (const control of this.list) {
            this.stack.addControl(control);
        }
    }

    // Le rend visible/invisible
    toggleMagnet(bool:boolean) {
        this.magnet.isVisible = bool;
    }

    // Permet de rassembler 2 listes
    mergeList(list:ListContainer) {
        if (this === list)  {
            console.log("bah wtf");
            return;
        }
        let new_list = list.getList().filter((x)=>x instanceof InstructionContainer);
        let id = this.getMagnetID();

        console.log("Merge : ", new_list)
        for (let i=0; i<new_list.length; i++) {
            this.addInstruction(new_list[i], i+id);
        }
        for (const struct of list.structureList) {
            this.addStruct(struct);
        }
        this.refreshIdentation();
        this.root.removeControl(list);
    }

    // Renvoie (et pour l'instant éxecute) la liste d'instructio, si elle est valide (possède un Depart)
    getInstructionGroup() : Launchable | null {
        let first = this.getFirst();
        if (first) {
            let l = first.getLaunchable(this.getInstructionList(1, this.list.length));
            l.onLaunch();
            if (first instanceof FlagContainer) l.execute([]);
            return l;
        }
        return null;
    }

    // Recursive pour renvoyer par groupe les instructions
    getInstructionList(first:number, length:number) : Executable[] {
        let exeGroup : Executable[] = [];
        for (let i=first; i<length + first; i++) {
            let instruction = this.list[i];
            if (instruction instanceof InstructionContainer) {
                let struct = this.checkHeaders(instruction);
                if (struct) { 
                    // On entre dans une boucle, on rappelle donc cette fonction pour obtenir tout ce qui est dedans
                    let len = struct.getQueueID() - struct.getHeaderID() - 1;
                    exeGroup.push(struct.getGroup(this.getInstructionList(struct.getHeaderID()+1, len))); // et on le renvoie sous forme d'un groupe
                    i += len + 1;
                } else exeGroup.push(instruction.getInstruction());
            }
        }
        return exeGroup;
    }

    // Vérifie si l'instructionContainer est le début d'une structure
    checkHeaders(i:InstructionContainer): StructureContainer | null {
        for (const struct of this.structureList) {
            if (struct.getHeader() === i) return struct;
        }
        return null;
    }

    // GETTERS
    getHover():boolean{return this.hover;}
    setHover(bool:boolean){
        if (bool) {
            this.detector.background = "white";
            if (this.scene.isDragging()) this.toggleMagnet(true);
            this.hover = bool;
            //console.log("hover");
        } else {
            this.detector.background = "#383838";
            this.toggleMagnet(false);
            this.hover = bool;
            //console.log("unhover");
        };
    }
    getListInstruction() : (Instruction[]) {
        let l = this.list.filter((x:InstructionContainer | Magnet) => x instanceof InstructionContainer);
        return l.map(((x:InstructionContainer) => x.getInstruction()));
    }
    getScene():GameScene{return this.scene;}
    getList():(InstructionContainer | Magnet)[]{return this.list;}
    getIdInstruction(i:InstructionContainer) : number{ return this.list.indexOf(i);}
    isFirst(): boolean {
        if (this.list.length > 0 && this.list[0] instanceof DepartContainer) return true;
        if (this.list.length > 1 && this.list[0] instanceof Magnet && this.list[1] instanceof DepartContainer) return true;
        return false;
    }
    getFirst(): DepartContainer | null {
        if (this.list.length > 0 && this.list[0] instanceof DepartContainer) return this.list[0];
        if (this.list.length > 1 && this.list[0] instanceof Magnet && this.list[1] instanceof DepartContainer) return this.list[1];
        return null;
    }
    getMagnetID(): number {return this.list.indexOf(this.magnet);}
    getDetector(): GUI.Rectangle {return this.detector;}

    toString():string {return "ListContainer : " + this.id.toString();}
    dispose(): void {
        if (this.getFirst() instanceof FlagContainer) {
            this.scene.removeGroupToRun();
        }
        this.scene.scene.onPointerObservable.remove(this.pointerObserver);
        this.scene.scene.onKeyboardObservable.remove(this.keyboardObserver);
        this.detector.dispose();
        this.stack.dispose();
        this.magnet.dispose();
        super.dispose();
    }
}
