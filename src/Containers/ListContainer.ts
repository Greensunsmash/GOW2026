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

// La classe qui permet de stocker plusieurs instructions container à la suite
// WARNING : Une instruction ne peut être seule et doit toujours être contenue dans un ListContainer
export class ListContainer extends GUI.Rectangle {

    private static count = 0;
    private readonly id: number;
    private readonly root: GUI.Container;
    private readonly content_root: GUI.Container;
    private readonly scene: GameScene;
    private readonly stack: GUI.StackPanel;
    private readonly magnet: Magnet;
    private pointerObserver: BABYLON.Observer<BABYLON.PointerInfo>;
    private readonly detector: GUI.Rectangle;
    private readonly list: (InstructionContainer | Magnet)[];
    private readonly structureList: StructureContainer[];
    private hover: boolean = false;
    public isDragging = false;

    constructor(root: GUI.Container, content_root : GUI.Container, scene: GameScene) {
        super();
        this.id = ListContainer.count;
        ListContainer.count += 1;
        this.root = root;
        this.content_root = content_root;
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
            const decal = this.scene.getDecal();

            if (this.detector.isHitTestVisible && pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                if (this.getHover()) {
                    if (!this.detector.contains(evt.x + decal.x, evt.y + decal.y) && this.scene.getHoverList() === this) {
                        this.scene.setHoverList(null);
                    } else if (scene.isDragging()) {
                        let x = evt.x + decal.x - this.stack.leftInPixels;
                        let y = evt.y + decal.y - this.stack.topInPixels;
                        y = this.moveTowards(y, this.magnet.centerY, 5);
                        if (!this.magnet.contains(x, y)) {
                            //console.log("Recalcul");
                            let found = false;
                            for (let i = 0; i < this.list.length; i++) {
                                if (this.list[i].contains(x, y)) { this.moveMagnet(this.list.indexOf(this.list[i])); found = true; break; }
                            }
                            if (!found && this.list.indexOf(this.magnet) != this.list.length - 1) this.moveMagnet(this.list.length - 1);
                        }
                    }
                } else {
                    if (this.detector.contains(evt.x+decal.x, evt.y+decal.y)) {
                        this.scene.setHoverList(this);
                    }
                }
            }
        });

        this.detector.onPointerDownObservable.add((pointerInfo) => this.click(pointerInfo.x, pointerInfo.y));


        this.scene.dragListeners.push(() => { this.stack.paddingBottom = "15px"; });
        this.scene.undragListeners.push(() => { this.stack.paddingBottom = "0px"; });
    }

    // Appelé lorsque qu'on appuie dessus, pour démarrer le drag
    click(x: number, y: number, forceStart?: boolean) {

        let nb: number;
        //console.log("click");
        for (nb = 0; nb < this.list.length; nb++) {
            if (this.list[nb] === this.magnet) continue;
            // Sélectionne sur quel bloc on appuie
            if (this.list[nb].contains(x, y) || forceStart) {
                //console.log("past 2/double wesh");
                let c = this.list[nb] as InstructionContainer;

                // Si jamais on a appuyé sur un Valeur/BooleenContainer, on lui transmet le drag
                let b = c.isPointHandle(new Vector2(x, y));
                if (b) {
                    console.log("ispointhandle propagated")
                    b.onPointerDownObservable.notifyObservers(new GUI.Vector2WithInfo(new Vector2(x, y)));
                    return;
                }

                const decal = this.getDecal(c, this.parent, new Vector2(x,y));
                this.scene.setDecal(decal);

                let l: ListContainer;
                if (this.scene.getHoverList() === this) this.scene.setHoverList(null);

                if (nb == 0 || (nb == 1 && this.list.indexOf(this.magnet) == 0)) {// On a pris le premier bloc, donc on déplace tout
                    l = this;
                    this.reparent(this, this.root, new Vector2(x + decal.x, y + decal.y));
                }
                else { // Sinon, il va falloir séparer en 2
                    l = new ListContainer(this.root, this.content_root, this.scene);

                    // Si on a cliqué sur la fin ou le milieu d'une structure, alors c'est comme si c'était le début de cette structure
                    const save = nb;
                    const s2 = this.structureList.filter((x) => x.getQueue() === this.list[nb] || x.getMid() === this.list[nb]);
                    if (s2.length === 1) {
                        nb = s2[0].getHeaderID();
                    }
                    if (nb == 0 || (nb == 1 && this.list.indexOf(this.magnet) == 0)) { // Si jamais en réalité, la structure commence la liste
                        l.dispose();
                        l = this;
                        this.reparent(this, this.root, new Vector2(x + decal.x, y + decal.y));
                    }
                    else {
                        let s = this.structureList.filter((x) => x.contains(nb));
                        let toMove: InstructionContainer[] = []; // Les blocs qu'on va déplacer
                        let structToMove: StructureContainer[] = []; // Les structures qu'on va déplacer
                        
                        const resolveSliceEnd = (structure: StructureContainer, start: number) => {
                            const mid = structure.getMid?.();
                            const midID = mid !== undefined && mid !== null ? structure.getMidID() : null;
                            const queueID = structure.getQueueID();
                            
                            if (midID !== null) {
                                if (start < midID) return midID;
                                return queueID;
                            }
                            return queueID;
                        };
                    
                        if (s.length === 1) { // Si le bloc n'appartient qu'à une seule structure
                            const end = resolveSliceEnd(s[0], nb);
                            
                            toMove = this.list.slice(nb, end).filter(
                                (x) => x instanceof InstructionContainer
                            );
                            
                            structToMove = this.structureList.filter((x) => {
                                const mid = x.getMid?.();
                                const midID = mid !== undefined && mid !== null ? x.getMidID() : null;
                                const upperBound = midID !== null && nb < midID ? midID : x.getQueueID();
                                
                                return x.getHeaderID() >= nb && x.getHeaderID() < upperBound;
                            });
                        }
                        else if (s.length > 1) { // Si le bloc appartient à plusieurs structure, on choisit la bonne
                            s.sort((x, y) => y.getHeaderID() - x.getHeaderID());
                            
                            const end = resolveSliceEnd(s[0], nb);
                            
                            toMove = this.list.slice(nb, end).filter(
                                (x) => x instanceof InstructionContainer
                            );
                            
                            structToMove = this.structureList.filter((x) => {
                                const mid = x.getMid?.();
                                const midID = mid !== undefined && mid !== null ? x.getMidID() : null;
                                const upperBound = midID !== null && nb < midID ? midID : x.getQueueID();
                                
                                return x.getHeaderID() >= nb && x.getHeaderID() < upperBound;
                            });
                        }
                        else { // Si ça n'appartient pas à une structure
                            toMove = this.list.slice(nb).filter(
                                (x) => x instanceof InstructionContainer
                            );
                            structToMove = this.structureList.filter((x) => x.getHeaderID() >= nb);
                        }
                        
                        console.log(toMove, structToMove);
                        // Et maintenant on déplace tout
                        for (const item of toMove) {
                            this.removeInstruction(item);
                        }
                        for (let i = toMove.length - 1; i >= 0; i--) {
                            l.addInstruction(toMove[i], 0);
                        }
                        for (const struct of structToMove) {
                            this.structureList.splice(this.structureList.indexOf(struct), 1);
                            l.addStruct(struct);
                        }
                        l.refreshIdentation();
                    }
                    nb = save;
                }

                //console.error("bip boup");
                // On setup le drag
                l.detector.isHitTestVisible = false;
                this.scene.setDragging(true);

                l.isDragging = true;
                let decalX = decal.x;
                let decalY = decal.y;

                //l.leftInPixels = xa;
                //l.topInPixels = ya;

                // On le fait bouger
                this.scene.scene.onPointerMove = (evt: IPointerEvent) => {
                    if (!l.isDragging) return;
                    l.leftInPixels = evt.x + decalX;
                    l.topInPixels = evt.y + decalY;
                }

                // On le relache
                this.scene.scene.onPointerUp = (_evt: IPointerEvent) => {
                    // j'ai rajouté ça du coup
                    this.scene.scene.onPointerMove = undefined as any;
                    this.scene.scene.onPointerUp = undefined as any;

                    if (l.isDragging && (!this.root.contains(_evt.x + decalX, _evt.y + decalY) || !this.content_root.contains(_evt.x + decalX, _evt.y+decalY) || this.scene.getToolbox().contains(_evt.x+decalX, _evt.y+decalY))) {
                        l.parent?.removeControl(l);
                        l.isDragging = false;
                        l.dispose();
                        // on compte le nb de blocs dans la liste 
                        this.scene.updateInstructionCount?.();
                        this.scene.setDragging(false);
                        this.scene.setDecal(new Vector2(0,0));
                        return;
                    }
                    l.isDragging = false;
                    let gros_q = this.scene.getHoverList();
                    if (gros_q instanceof ListContainer && gros_q != l) {
                        if ((gros_q.getMagnetID() === 0 && !gros_q.isFirst()) || (gros_q.getMagnetID() > 0 && !l.isFirst())) {
                            gros_q.mergeList(l);
                            this.scene.setDragging(false);
                            l.dispose();
                        } else {
                            this.scene.setDragging(false);
                            this.reparent(l, this.content_root, new Vector2(_evt.x+decalX, _evt.y+decalY));
                            l.detector.isHitTestVisible = true;
                        }
                    } else {
                        this.scene.setDragging(false);
                        this.reparent(l, this.content_root, new Vector2(_evt.x+decalX, _evt.y+decalY));
                        l.detector.isHitTestVisible = true;
                    }
                    this.scene.setDecal(new Vector2(0,0));
                }
                break;

            }
        }

    }

    // Renvoie l'indentation d'un bloc, basé sur son index
    getIndentation(id: number) {
        let sum = 0;
        for (const structure of this.structureList) {
            //console.log("Struct : ", structure.getHeaderID(), structure.getQueueID());
            if (structure.contains(id)) sum += 20;
        }
        return sum;
    }

    // Mets à jour l'indentation de tous les blocs
    refreshIdentation() {
        for (let i = 0; i < this.list.length; i++) { // Ca comprend le magnet mais osef, faudra l régler lui aussi
            this.list[i].paddingLeftInPixels = this.getIndentation(i);
        }
    }

    addStruct(s: StructureContainer) {
        this.structureList.push(s);
        s.setList(this);
        this.refreshIdentation();
    }

    addInstruction(c: InstructionContainer, index: number) {
        if (c.parent) { c.parent.removeControl(c); }

        this.list.splice(index, 0, c);
        this.stack.clearControls();
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].paddingLeftInPixels = this.getIndentation(i);
            this.stack.addControl(this.list[i]);
        }

    }

    removeInstruction(c: InstructionContainer) {
        if (this.list.length <= 1) return;
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
    toggleMagnet(bool: boolean) {
        this.magnet.isVisible = bool;
    }

    // Permet de rassembler 2 listes
    mergeList(list: ListContainer) {
        if (this === list) {
            console.log("bah wtf");
            return;
        }
        let new_list = list.getList().filter((x) => x instanceof InstructionContainer);
        let id = this.getMagnetID();

        console.log("Merge : ", new_list)
        for (let i = 0; i < new_list.length; i++) {
            this.addInstruction(new_list[i], i + id);
        }
        for (const struct of list.structureList) {
            this.addStruct(struct);
        }
        this.refreshIdentation();
        this.root.removeControl(list);
    }

    // Renvoie la liste d'instructions, si elle est valide (possède un Depart)
    getInstructionGroup(): Launchable | null {
        let first = this.getFirst();
        if (first) {
            let l = first.getLaunchable(this.getInstructionList(1, this.list.length));
            return l;
        }
        return null;
    }

    // Recursive pour renvoyer par groupe les instructions
    getInstructionList(first: number, length?: number): Executable[] {
        let exeGroup: Executable[] = [];
        if (length === undefined) length = this.list.length;
        for (let i = first; i < length + first; i++) {
            let instruction = this.list[i];
            if (instruction instanceof InstructionContainer) {
                let struct = this.checkHeaders(instruction);
                if (struct) {
                    // On entre dans une boucle, on rappelle donc cette fonction pour obtenir tout ce qui est dedans
                    const mid = struct.getMidID();
                    if (mid) { // Si il est en 2 parties, comme si sinon par exemple
                        let len1 = mid - struct.getHeaderID() - 1;
                        let len2 = struct.getQueueID() - mid - 1;
                        exeGroup.push(struct.getGroup(this.getInstructionList(struct.getHeaderID() + 1, len1), this.getInstructionList(mid + 1, len2)));
                        i += len1 + len2 + 2;
                    } else {
                        let len = struct.getQueueID() - struct.getHeaderID() - 1;
                        exeGroup.push(struct.getGroup(this.getInstructionList(struct.getHeaderID() + 1, len))); // et on le renvoie sous forme d'un groupe
                        i += len + 1;
                    }
                } else exeGroup.push(instruction.getInstruction());
            }
        }
        return exeGroup;
    }

    getInnerInstContainers(): InstructionContainer[] {
        let insts = [];
        for (const item of this.list) {
            if (item instanceof InstructionContainer)
                insts.push(item);
        }
        return insts;
    } 

    getInstructionCount(): number {
        let count = 0;
        for (const item of this.list) {
            if (item instanceof FlagContainer) continue;
            if (!(item instanceof InstructionContainer)) continue;
            if (this.structureList.some(s => s.getQueue() === item)) continue; // pour pas compter les struct en double
            count += 1;
        }
        return count;
    }

    // Vérifie si l'instructionContainer est le début d'une structure
    checkHeaders(i: InstructionContainer): StructureContainer | null {
        for (const struct of this.structureList) {
            if (struct.getHeader() === i) return struct;
        }
        return null;
    }

    getDecal(control: GUI.Control, parent: GUI.Container, pointer: Vector2): Vector2 {
        // Cette fonction ne marche pas. Losque je serai capable de récupérer la position absolu d'un bloc, il suffira de soustraire au pointeur la position absolue de pointeur.
        // En attendant, return 0
        const ptn = control.transformedMeasure;
        return new Vector2(ptn.left - pointer.x, ptn.top - pointer.y);
    }

    // Pour changer le parent d'un bloc
    reparent(control: GUI.Control, newParent: GUI.Container, position:Vector2) {
        
        control.parent?.removeControl(control);
        newParent.addControl(control);
        const new_pos = newParent.getLocalCoordinates(position);

        const centerX = newParent.widthInPixels / 2;
        const centerY = newParent.heightInPixels / 2;

        control.leftInPixels = (new_pos.x - centerX) / newParent.scaleX + centerX;
        control.topInPixels  = (new_pos.y - centerY) / newParent.scaleY + centerY;
    }

    // GETTERS
    getHover(): boolean { return this.hover; }
    setHover(bool: boolean) {
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
    getListInstruction(): (Instruction[]) {
        let l = this.list.filter((x: InstructionContainer | Magnet) => x instanceof InstructionContainer);
        return l.map(((x: InstructionContainer) => x.getInstruction()));
    }
    getScene(): GameScene { return this.scene; }
    getList(): (InstructionContainer | Magnet)[] { return this.list; }
    getIdInstruction(i: InstructionContainer): number { return this.list.indexOf(i); }
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
    getMagnetID(): number { return this.list.indexOf(this.magnet); }
    getDetector(): GUI.Rectangle { return this.detector; }

    toString(): string { return "ListContainer : " + this.id.toString(); }
    dispose(): void {
        this.scene.scene.onPointerObservable.remove(this.pointerObserver);
        this.detector.dispose();
        this.stack.dispose();
        this.magnet.dispose();
        super.dispose();
    }
}
