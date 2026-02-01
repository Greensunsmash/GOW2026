import { PointerEventTypes } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";

export class DragBehavior {

    private target: BlocContainer;
    private scene: GameScene;

    constructor(target: BlocContainer, scene: GameScene) {
        this.target = target;
        this.scene = scene;
        this.init();
    }

    private init(): void {
        this.freeDrag();
    }

    private freeDrag(): void {
        let isDragging = false;
        let decalX = 0;
        let decalY = 0;

        this.target.onPointerDownObservable.add((pointerInfo) => {

            const parent = this.target.parent;

            if (parent instanceof GUI.Rectangle) {

                const measure = this.target._currentMeasure;
                const absLeft = measure.left;
                const absTop = measure.top;

                let parentBloc: BlocContainer | null = null;
                let current: GUI.Control | null = this.target.parent as GUI.Control | null;

                while (current) {
                    if (current instanceof BlocContainer) {
                        parentBloc = current;
                        break;
                    }
                    current = current.parent as GUI.Control | null;
                }
                if (this.target.parent) {
                    this.target.parent.removeControl(this.target);
                }
                if (parentBloc) {
                    parentBloc.resetEmptySlot(parent);
                }

                this.target.getTexture().addControl(this.target);

                this.target.leftInPixels = absLeft;
                this.target.topInPixels = absTop;
            }

            isDragging = true;
            this.target.isPointerBlocker = false;

            decalX = this.target.leftInPixels - pointerInfo.x;
            decalY = this.target.topInPixels - pointerInfo.y;
        });

        this.target.onPointerUpObservable.add(() => {
            isDragging = false;
            this.target.isPointerBlocker = true;
            this.scene.hoverSlot?.replaceSlot(this.target);
        });

        this.scene.scene.onPointerObservable.add((pointerInfo) => {
            if (!isDragging) return;

            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const evt = pointerInfo.event;
                this.target.leftInPixels = evt.x + decalX;
                this.target.topInPixels = evt.y + decalY;
            }

            if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                isDragging = false;
                this.target.isPointerBlocker = true;
                this.scene.hoverSlot?.replaceSlot(this.target);
            }
        });
    }
}


