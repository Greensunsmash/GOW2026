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
import { Colors } from "../Shared/Colors";
import { BaseVSpacer } from "../MRGUI/misc/BaseSpacers";
import type { InstructionData, ListData, ProgramData } from "../Shared/types";
import { _setProgram } from "@babylonjs/core/Engines/thinEngine.functions";
import type { InstructionData, ProgramData } from "../Shared/types";
import { SoundManager } from "../Shared/Sounds";
import { TwoButtonModal } from "../MRGUI/windows/TwoButtonsModal";

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
        this.thickness = 0;
        this.clipChildren = false;
        this.clipContent = false;

        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.stack = new GUI.StackPanel();
        this.stack.adaptWidthToChildren = true;
        this.stack.adaptHeightToChildren = true;
        this.stack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.stack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.stack.isHitTestVisible = false;
        this.stack.clipChildren = false;
        this.stack.clipContent = false;

        this.detector = new GUI.Rectangle();
        this.detector.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detector.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.detector.height = "100%"
        this.detector.width = "100%";
        this.detector.alpha = 0.1;
        //this.detector.thickness = 0;
        this.detector.isHitTestVisible = true;

        this.scene = scene;

        root.addControl(this);
        this.addControl(this.stack);
        this.addControl(this.detector);

        this.magnet = new Magnet(this.scene, this);
        this.list.push(this.magnet);
        this.stack.addControl(this.magnet);

        // Même moi j'y comprends rien
        /*this.pointerObserver = this.scene.scene.onPointerObservable.add((pointerInfo) => {
            const decal = this.scene.getDecal();

            if (this.detector.isHitTestVisible && pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                if (this.getHover()) {
                    if (!this.detector.contains(evt.x + decal.x, evt.y + decal.y) && this.scene.getHoverList() === this) {
                        this.scene.setHoverList(null);
                    } else if (scene.isDragging()) {
                        let x = evt.x + decal.x - this.stack.leftInPixels;
                        let y = evt.y + decal.y - this.stack.topInPixels;
                        //let x = evt.x + decal.x - this.leftInPixels;
                        //let y = evt.y + decal.y - this.topInPixels;
                        //y = this.moveTowards(y, this.magnet.centerY, 5);
                        y = this.moveTowards(y, this.magnet.centerY, 60);
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
        });*/
        this.pointerObserver = this.scene.scene.onPointerObservable.add((pointerInfo) => {
            const decal = this.scene.getDecal();

            if (this.detector.isHitTestVisible && pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                
                // ─── LE FIX ANTI-BUG D'ÉCRAN EST ICI ───
                // On utilise les coordonnées internes corrigées par le moteur 3D,
                // qui prennent en compte la résolution et le zoom de n'importe quel PC !
                const pointerX = this.scene.scene.pointerX;
                const pointerY = this.scene.scene.pointerY;

                if (this.getHover()) {
                    // On utilise pointerX et pointerY pour les vérifications de survol
                    if (!this.detector.contains(pointerX + decal.x, pointerY + decal.y) && this.scene.getHoverList() === this) {
                        this.scene.setHoverList(null);
                    } else if (this.scene.isDragging()) {
                        
                        let closestIndex = -1;
                        let minDistance = Infinity;

                        // 1. On cherche le bloc dont le centre vertical est le plus proche de la souris
                        for (let i = 0; i < this.list.length; i++) {
                            const item = this.list[i];
                            if (item === this.magnet) continue; 
                            
                            const measure = item.transformedMeasure;
                            if (!measure) continue;

                            const itemCenterY = measure.top + (measure.height / 2);
                            const distance = Math.abs(pointerY - itemCenterY); // Comparaison parfaite !

                            if (distance < minDistance) {
                                minDistance = distance;
                                closestIndex = i;
                            }
                        }

                        // 2. On place l'aimant au-dessus ou en dessous de ce bloc
                        if (closestIndex !== -1) {
                            const closestItem = this.list[closestIndex];
                            const closestCenterY = closestItem.transformedMeasure.top + (closestItem.transformedMeasure.height / 2);
                            
                            let insertIndex = closestIndex;
                            if (pointerY > closestCenterY) {
                                insertIndex += 1;
                            }

                            const currentMagnetIndex = this.list.indexOf(this.magnet);
                            if (insertIndex > currentMagnetIndex) {
                                insertIndex -= 1;
                            }

                            if (currentMagnetIndex !== insertIndex) {
                                this.moveMagnet(insertIndex);
                            }
                        }
                        
                    }
                } else {
                    if (this.detector.contains(pointerX + decal.x, pointerY + decal.y)) {
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

                SoundManager.playSound("pickBloc");
                
                let c = this.list[nb] as InstructionContainer;

                // Si jamais on a appuyé sur un Valeur/BooleenContainer, on lui transmet le drag
                let b = c.isPointHandle(new Vector2(x, y));
                if (b) {
                    //console.log("ispointhandle propagated")
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
                                return x.getHeaderID() >= nb && x.getHeaderID() < end;
                            });
                        }
                        else if (s.length > 1) { // Si le bloc appartient à plusieurs structure, on choisit la bonne
                            s.sort((x, y) => y.getHeaderID() - x.getHeaderID());
                            
                            const end = resolveSliceEnd(s[0], nb);
                            
                            structToMove = this.structureList.filter((x) => {
                                return x.getHeaderID() >= nb && x.getHeaderID() < end;
                            });

                            toMove = this.list.slice(nb, end).filter(
                                (x) => x instanceof InstructionContainer
                            );
                            
                        }
                        else { // Si ça n'appartient pas à une structure
                            toMove = this.list.slice(nb).filter(
                                (x) => x instanceof InstructionContainer
                            );
                            structToMove = this.structureList.filter((x) => x.getHeaderID() >= nb);
                        }
                        
                        //console.log(toMove, structToMove);
                        // Et maintenant on déplace tout
                        for (const item of toMove) {
                            this.removeInstruction(item, true);
                        }
                        for (let i = toMove.length - 1; i >= 0; i--) {
                            l.addInstruction(toMove[i], 0, true);
                        }
                        for (const struct of structToMove) {
                            this.structureList.splice(this.structureList.indexOf(struct), 1);
                            l.addStruct(struct);
                        }
                        this.recomputeInstructions();
                        l.recomputeInstructions();
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
                        const deleteList = () => {  
                            l.parent?.removeControl(l);
                            l.isDragging = false;
                            l.dispose();
                            // on compte le nb de blocs dans la liste 
                            this.scene.updateInstructionCount?.();
                            //this.scene.saveProgram?.();
                            this.scene.setDragging(false);
                            this.scene.setDecal(new Vector2(0,0));
                        };
                        const cancelDelete = () => {
                            l.isDragging = false;
                            this.scene.setDragging(false);
                            this.reparent(l, this.content_root, new Vector2(x + decalX, y + decalY));
                            l.detector.isHitTestVisible = true;
                            this.scene.setDecal(new Vector2(0, 0));
                            //this.scene.saveProgram?.();
                        };
                        if (l.getList().length > 2) { // tjr un magnet donc 2
                            new TwoButtonModal(
                                this.scene.advancedTexture,
                                "Es-tu sûr de supprimer ces blocs ?",
                                "Annuler",
                                "Supprimer",
                                () => deleteList(),
                                () => cancelDelete()
                            );
                        } else deleteList();
                        return;
                    }
                    l.isDragging = false;
                    let gros_q = this.scene.getHoverList();
                    if (gros_q instanceof ListContainer && gros_q != l) {
                        if ((gros_q.getMagnetID() === 0 && !gros_q.isFirst()) || (gros_q.getMagnetID() > 0 && !l.isFirst())) {
                            gros_q.mergeList(l);
                            if (this !== l && this.getList().length > 0) {
                                this.recomputeInstructions();
                            }
                            this.scene.setDragging(false);
                            SoundManager.playSound("releaseBloc");
                            l.dispose();
                        } else {
                            this.scene.setDragging(false);
                            this.reparent(l, this.content_root, new Vector2(_evt.x+decalX, _evt.y+decalY));
                            l.detector.isHitTestVisible = true;
                            SoundManager.playSound("emptyReleaseBloc");
                        }
                        //this.scene.saveProgram?.();
                    } else {
                        this.scene.setDragging(false);
                        this.reparent(l, this.content_root, new Vector2(_evt.x+decalX, _evt.y+decalY));
                        l.detector.isHitTestVisible = true;
                        SoundManager.playSound("emptyReleaseBloc");
                        //this.scene.saveProgram?.();
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
            if (structure.contains(id)) sum += 60;
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
        this.recomputeInstructions();
    }

    addInstruction(c: InstructionContainer, index: number, skipRebuild: boolean = false) {
        if (c.parent) { c.parent.removeControl(c); }

        this.list.splice(index, 0, c);
        if (!skipRebuild) this.recomputeInstructions();
    }

    recomputeInstructions() {
        //console.log(this.list);

        this.stack.clearControls();
        const listNoMagnet = this.list.filter(e => !(e instanceof Magnet));

        const indentationList: number[] = this.list.map((_, index) => this.getIndentation(index));

        for (let i = 0; i < this.list.length; i++) {
            const currIdent = indentationList[i];

            const isHeader = this.structureList.some(s => s.getHeader() === this.list[i]);
            const isMid = this.structureList.some(s => s.getMid() === this.list[i]);
            const isQueue = this.structureList.some(s => s.getQueue() === this.list[i]);
            const nextRealIndex = this.list.findIndex((e, idx) => idx > i && !(e instanceof Magnet));
            const nextIndent = nextRealIndex !== -1 ? indentationList[nextRealIndex] : undefined;
            const isLastInStruct = nextIndent !== undefined ? currIdent > nextIndent : true;

            if (isQueue || isMid) {
                const spacer = new BaseVSpacer(10);
                //this.applyDosC(spacer, currIdent);
                this.stack.addControl(spacer);
            }
            
            this.list[i].paddingLeftInPixels = currIdent;
            if (this.list[i] instanceof InstructionContainer) {
                //(this.list[i] as InstructionContainer).refreshDosC(currIdent);
            }
            this.stack.addControl(this.list[i]);

            if (isHeader || isMid) {
                const spacer = new BaseVSpacer(10);
                //this.applyDosC(spacer, currIdent);
                this.stack.addControl(spacer);
            }

            //console.log("currIdent is " + currIdent + " nextIdent is " + nextIndent + " so islastinstructu is " + isLastInStruct);

            if (!(this.list[i] instanceof Magnet) && !isHeader && !isMid && !isLastInStruct) {
                const indexInNoMagnet = listNoMagnet.indexOf(this.list[i] as InstructionContainer);
                if (indexInNoMagnet + 1 < listNoMagnet.length) {
                    //console.log("creating the whisky scotch");
                
                    const scotch = new GUI.Container();
                    scotch.heightInPixels = 5;
                    scotch.width = "100%";
                    scotch.clipChildren = false;

                    /*
                    pour apposer le scotch, je prend 
                    la val. min de la largeur des deux blocs à relier comme base
                    */
                    const minWidth = Math.min(this.list[i].widthInPixels, this.list[i+1].widthInPixels);
                    //console.log("min width : " + minWidth);
                    const scotchGauche = new GUI.Rectangle();
                    scotchGauche.widthInPixels = 12;
                    scotchGauche.heightInPixels = 15;
                    scotchGauche.cornerRadius = 8;
                    scotchGauche.background = Colors.SecondaryEnseignement;
                    scotchGauche.thickness = 0;
                    scotchGauche.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                    scotchGauche.leftInPixels = 20 + currIdent; 
                    scotchGauche.alpha = 0.5;

                    let scotchDroit = null;
                    if (minWidth > 60) {
                        scotchDroit = new GUI.Rectangle();
                        scotchDroit.widthInPixels = 12;
                        scotchDroit.heightInPixels = 15;
                        scotchDroit.cornerRadius = 8;
                        scotchDroit.background = Colors.SecondaryEnseignement;
                        scotchDroit.thickness = 0;
                        scotchDroit.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                        scotchDroit.leftInPixels = currIdent + (minWidth - scotchGauche.leftInPixels - scotchDroit.widthInPixels);
                        scotchDroit.alpha = 0.5;
                    } 


                    //scotch.topInPixels = -20;
                    // ALAIDE JE COMPRENDS RIEN
                    scotch.addControl(scotchGauche);
                    if (scotchDroit) scotch.addControl(scotchDroit);

                    //this.applyDosC(scotch, currIdent);
                    this.stack.addControl(scotch);
                }
            }
        }
    }

    removeInstruction(c: InstructionContainer, skipRebuild: boolean = false) {
        if (this.list.length <= 1) return;
        let nb = this.list.indexOf(c);
        //this.stack.removeControl(c);
        this.list.splice(nb, 1);
        if (!skipRebuild) this.recomputeInstructions();
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
        this.recomputeInstructions();
    }

    // Le rend visible/invisible
    toggleMagnet(bool: boolean) {
        this.magnet.isVisible = bool;
    }

    // Permet de rassembler 2 listes
    mergeList(list: ListContainer) {
        if (this === list) {
            return;
        }
        let new_list = list.getList().filter((x) => x instanceof InstructionContainer);
        let id = this.getMagnetID();

        //console.log("Merge : ", new_list)
        for (let i = 0; i < new_list.length; i++) {
            this.addInstruction(new_list[i], i + id, true /*skipRebuud*/);
        }
        for (const struct of list.structureList) {
            this.addStruct(struct);
        }
        this.recomputeInstructions();
        this.root.removeControl(list);

        this.scene.updateInstructionCount?.();
        //this.scene.saveProgram?.();
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
            //if (item instanceof FlagContainer) continue;
            if (!(item instanceof InstructionContainer)) continue;
            if (this.structureList.some(s => s.getQueue() === item)) continue; // pour pas compter les struct en double
            if (this.structureList.some(s => s.getMid() === item)) continue; // pour pas compter les struct en double
            count += 1;
        }
        // je savais pas ou mettre le debug
        //console.log(this.serializeList());
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

        this.scene.updateInstructionCount?.();
        //this.scene.saveProgram?.();
    }

    private applyDosC(composant: GUI.Container, indent: number, height: number = 10) {

        const ancien = composant.children.find(c => c.name === "morceau_dos_C");
        if (ancien) {
            composant.removeControl(ancien);
            ancien.dispose();
        }

        if (indent === 0) return;

        const morceau = new GUI.Rectangle("morceau_dos_C");
        morceau.background = Colors.PtitRoseDuSoir;
        morceau.thickness = 0;
        morceau.heightInPixels = height;
        morceau.widthInPixels = 40;
        morceau.paddingLeftInPixels = -20;
        morceau.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        morceau.zIndex = -1;
        morceau.isHitTestVisible = false;

        composant.addControl(morceau);
    }

    public clearHighlights() {
        for (const inst of this.list) {
            if (inst instanceof InstructionContainer)
                inst.setHighlighht(false);
        }
    }

    // GETTERS
    getHover(): boolean { return this.hover; }
    setHover(bool: boolean) {
        if (bool) {
            this.detector.background = Colors.Workbench;
            if (this.scene.isDragging()) this.toggleMagnet(true);
            this.hover = bool;
            //console.log("hover");
        } else {
            this.detector.background = "#00000000";
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

    toString(): string { return "ListContainer : " + this.id.toString();}
    printOrganization(): void {
        for (const s of this.structureList) {console.log("Structure : ", s.getHeaderID(), s.getQueueID());}
        for (const l of this.list) {console.log("- Bloc", l);}
    }

    public serializeList(): ListData {
        const serializeInstruction = (inst: InstructionContainer) => {
            if (inst instanceof InstructionContainer) {
                const serialized = inst.serialize();
                if (serialized.type) return serialized;
                else return null;
            }
        };

        const serializeListAux = (first: number = 0, length?: number): InstructionData[] => {
            const program: InstructionData[] = [];
            if (length === undefined) length = this.list.length;
            for (let i = first; i < length + first; i++) {
                let instruction = this.list[i];
                if (instruction instanceof InstructionContainer) {
                    const serialized = instruction.serialize();
                    if (!serialized) continue;
                    const struct = this.checkHeaders(instruction);
                    if (struct) {
                        const mid = struct.getMidID();
                        if (mid) { // Si il est en 2 parties, comme si sinon par exemple
                            let len1 = mid - struct.getHeaderID() - 1;
                            let len2 = struct.getQueueID() - mid - 1;
                            serialized.children1 = serializeListAux(struct.getHeaderID() + 1, len1);
                            serialized.children2 = serializeListAux(mid + 1, len2);
                            i += len1 + len2 + 2;
                        } else {
                            let len = struct.getQueueID() - struct.getHeaderID() - 1;
                            serialized.children1 = serializeListAux(struct.getHeaderID() + 1, len); 
                            i += len + 1;
                        }
                    }
                    program.push(serialized);
                }
            }
            return program;
        }

        return {insts: serializeListAux(), x: this.leftInPixels, y: this.topInPixels};
    }

    dispose(): void {
        this.scene.scene.onPointerObservable.remove(this.pointerObserver);
        this.detector.dispose();
        this.stack.dispose();
        this.magnet.dispose();
        super.dispose();
    }
}
