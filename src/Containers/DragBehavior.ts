import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import type { IPointerEvent } from "@babylonjs/core";
import { BlocContainer } from "./BlocContainer";
import { EmptySlot } from "./EmptySlot";

export class DragBehavior {

    private target: BlocContainer;
    private scene: GameScene;
    private isDragging = false;

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

    private startDrag(x: number, y: number) {
        const measure = this.target._currentMeasure;
        const startX = measure.left;
        const startY = measure.top;

        const previousWrapper = this.target.parent as GUI.Rectangle;
        const previousContainer = previousWrapper?.parent?.parent as BlocContainer;

        if (previousContainer instanceof BlocContainer) {
            previousContainer.resetEmptySlot(previousWrapper);
        }
        this.target.getRoot().addControl(this.target);

        this.target.leftInPixels = startX;
        this.target.topInPixels = startY;
        this.isDragging = true;
        const decalX = startX - x;
        const decalY = startY - y;
        this.target.isHitTestVisible = false;

        // MOVE
        this.scene.scene.onPointerMove = (evt: IPointerEvent) => {
            if (!this.isDragging) return;

            this.target.leftInPixels = evt.x + decalX;
            this.target.topInPixels = evt.y + decalY;
        };

        // UP
        this.scene.scene.onPointerUp = () => this.stopDrag();
    }

    private stopDrag() {
        this.isDragging = false;
        this.target.isHitTestVisible = true;
        let slot = this.scene.getHoverSlot()
        if (slot instanceof EmptySlot) {slot.replaceIfMatch(this.target);}
        // Important : on nettoie les callbacks (je l'ai pas fait ailleurs oupsi)
        this.scene.scene.onPointerMove = undefined as any;
        this.scene.scene.onPointerUp = undefined as any;
    }
}