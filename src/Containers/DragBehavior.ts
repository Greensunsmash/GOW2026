import type { IPointerEvent } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import { EmptySlot } from "./EmptySlot";

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

        const measure = this.target._currentMeasure;
        const startX = measure.left;
        const startY = measure.top;

        const previousWrapper = this.target.parent as GUI.Rectangle;
        const previousContainer = previousWrapper?.parent?.parent as BlocContainer;

        // Remets le bloc enfant de la root pour le déplacer
        if (previousContainer instanceof BlocContainer) {
            previousContainer.resetEmptySlot(previousWrapper);
        } else {
            this.target.parent?.removeControl(this.target);
        }
        this.target.getRoot().addControl(this.target);

        if (!coordsAbsolute) {
            this.target.leftInPixels = startX;
            this.target.topInPixels = startY;
        }
        this.isDragging = true;
        //this.scene.setDragging(true);

        const decalX = coordsAbsolute ? 0 : startX - x;
        const decalY = coordsAbsolute ? 0 : startY - y;
        this.target.isHitTestVisible = false;

        // MOVE
        this.scene.scene.onPointerMove = (evt: IPointerEvent) => {
            if (!this.isDragging) return;
            this.lastX = evt.x;
            this.lastY = evt.y;
            this.target.leftInPixels = evt.x + decalX;
            this.target.topInPixels = evt.y + decalY;
        };

        // UP
        this.scene.scene.onPointerUp = () => {this.stopDrag();};
    }

    // Arrêt du drage
    private stopDrag() {
        // Important : on nettoie les callbacks (je l'ai pas fait ailleurs oupsi)
        this.scene.scene.onPointerMove = undefined as any;
        this.scene.scene.onPointerUp = undefined as any;
        this.target.isHitTestVisible = true;
        const toolbox = this.scene.getToolbox();
        if (this.isDragging && toolbox.contains(this.lastX, this.lastY)) {
            this.scene.blockCount--;
            this.target.parent?.removeControl(this.target);
            this.target.dispose();
        }
        this.isDragging = false;
        //this.scene.setDragging(false);
        let slot = this.scene.getHoverSlot();
        if (slot instanceof EmptySlot) {slot.replaceIfMatch(this.target);}
    }
}