import { Vector2, type IPointerEvent } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import { EmptySlot } from "./EmptySlot";
import { SoundManager } from "../Shared/Sounds";

// Class permettant au blocContainer d'être déplaçable
export class DragBehavior {

    private readonly target: BlocContainer;
    private readonly scene: GameScene;
    private isDragging = false;
    private lastX: number = 0;
    private lastY: number = 0;

    constructor(target: BlocContainer) {
        this.target = target;
        this.scene = target.getScene();
        this.init();
    }

    private init(): void {
        this.target.onPointerDownObservable.add((pointerInfo) => {
            this.startDrag(pointerInfo.x, pointerInfo.y);
        });
    }

    // Comportement de drag
    public startDrag(x: number, y: number, coordsAbsolute?: boolean) {
        this.lastX = x;
        this.lastY = y;

        //console.log('xsh');
        
        const measure = this.target._currentMeasure;
        const startX = measure.left;
        const startY = measure.top;
        
        this.isDragging = true;
        this.target.getScene().dragging_bloc = true;
        const previousWrapper = this.target.parent as GUI.Rectangle;
        const previousContainer = previousWrapper?.parent?.parent as BlocContainer;

        // Remets le bloc enfant de la root pour le déplacer
        if (previousContainer instanceof BlocContainer) {
            previousContainer.resetEmptySlot(previousWrapper);
        }
        const decal = this.getDecal(new Vector2(x,y));
        this.reparent(this.target, this.target.getRoot(), new Vector2(this.lastX+decal.x, this.lastY+decal.y));


        this.target.getScene().setDecal(decal);

        this.target.isHitTestVisible = false;

        // MOVE
        this.scene.scene.onPointerMove = (evt: IPointerEvent) => {
            if (!this.isDragging) return;
            this.lastX = evt.x + decal.x;
            this.lastY = evt.y + decal.y;
            this.target.leftInPixels = this.lastX;
            this.target.topInPixels = this.lastY;
        };

        // UP
        this.scene.scene.onPointerUp = () => {console.log("release"); this.stopDrag();};
    }

    // Arrêt du drag
    private stopDrag() {
        // Important : on nettoie les callbacks (je l'ai pas fait ailleurs oupsi)
        this.scene.scene.onPointerMove = undefined as any;
        this.scene.scene.onPointerUp = undefined as any;
        this.target.isHitTestVisible = true;

        if (this.isDragging && (!this.target.getRoot().contains(this.lastX, this.lastY) || !this.target.getContentRoot().contains(this.lastX, this.lastY) || this.scene.getToolbox().contains(this.lastX, this.lastY))) {
            this.scene.updateInstructionCount?.();
            this.target.parent?.removeControl(this.target);
            this.target.getScene().setDecal(new Vector2(0,0));
            this.target.getScene().dragging_bloc = false;
            this.isDragging = false;
            this.target.dispose();
            return;
        }
        
        this.reparent(this.target, this.target.getContentRoot(), new Vector2(this.lastX, this.lastY));
        this.target.parent?.removeControl(this.target);
        this.target.getContentRoot().addControl(this.target);
        //this.scene.setDragging(false);
        let slot = this.scene.getHoverSlot();
        if (slot instanceof EmptySlot) {slot.replaceIfMatch(this.target);}
        this.target.getScene().setDecal(new Vector2(0,0));
        this.target.getScene().dragging_bloc = false;
        //this.scene.saveProgram?.();
        this.isDragging = false;
        SoundManager.playSound("clip.ogg", 1);
    }

    // Pour changer le parent d'un bloc
    public reparent(control: GUI.Control, newParent: GUI.Container, position:Vector2) {
        
        control.parent?.removeControl(control);
        newParent.addControl(control);
        const new_pos = newParent.getLocalCoordinates(position);

        const centerX = newParent.widthInPixels / 2;
        const centerY = newParent.heightInPixels / 2;

        control.leftInPixels = (new_pos.x - centerX) / newParent.scaleX + centerX;
        control.topInPixels  = (new_pos.y - centerY) / newParent.scaleY + centerY;
    }

    getDecal(pointer: Vector2): Vector2 {
        // Cette fonction ne marche pas. Losque je serai capable de récupérer la position absolu d'un bloc, il suffira de soustraire au pointeur la position absolue de pointeur.
        // En attendant, return 0
        const ptn = this.target.transformedMeasure;
        return new Vector2(ptn.left - pointer.x, ptn.top - pointer.y);
    }
}