import * as GUI from "@babylonjs/gui";
import { BlocContainer } from "./BlocContainer";
import { ListContainer } from "./ListContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";

export class DragBehavior {

    private target : BlocContainer | ListContainer;
    private movable : BlocContainer | ListContainer;
    private scene : GameScene

    constructor(target: BlocContainer | ListContainer, movable? : ListContainer | BlocContainer) {
        this.target = target;
        this.movable = movable?? target;
        this.scene = target.getScene();
        this.init();
    }

    private init(): void {
        /*
        let isDragging = false;
        let decalX = 0;
        let decalY = 0;

        // Ajout d'une fonction qui sera appellée lorsqu'on appuie sur le control
        this.target.onPointerDownObservable.add((pointerInfo) => {

            const parent = this.movable.parent;
            this.movable.unableSlotHovering();
            this.movable.zIndex = 1;

            // Si jamais le movable appartient déjà à un BlocContainer (on le décroche)
            if (parent instanceof GUI.Rectangle && this.movable instanceof BlocContainer) {
                const measure = this.movable._currentMeasure;
                const absLeft = measure.left;
                const absTop = measure.top;

                let parentBloc: BlocContainer | null = null;
                let current: GUI.Control | null = this.movable.parent as GUI.Control | null;

                while (current) {
                    if (current instanceof BlocContainer) {
                        parentBloc = current;
                        break;
                    }
                    current = current.parent as GUI.Control | null;
                }
                if (this.movable.parent) {
                    this.movable.parent.removeControl(this.movable);
                }
                if (parentBloc) {
                    parentBloc.resetEmptySlot(parent);
                }

                this.movable.getRoot().addControl(this.movable);

                this.movable.leftInPixels = absLeft;
                this.movable.topInPixels = absTop;
            } 
            // Si jamais le movable appartient déjà à une listContainer (on le décroche)
            else if (parent instanceof GUI.StackPanel && this.movable instanceof ListContainer) {
                if (parent.parent instanceof InstructionContainer) parent.parent.removeNext(); // Tkt gaia ça marche
            } else { // Utile pour que le bloc soit affiché au dessus des autres
                this.movable.getRoot().removeControl(this.movable);
                this.movable.getRoot().addControl(this.movable);
            }
            
            isDragging = true;

            decalX = this.movable.leftInPixels - pointerInfo.x;
            decalY = this.movable.topInPixels - pointerInfo.y;

            // Ajout à la scène principale de la fonction permettant de déplacer le bloc 
            this.scene.scene.onPointerMove = (evt:IPointerEvent) => {
                if (!isDragging) return;
                this.movable.leftInPixels = evt.x + decalX;
                this.movable.topInPixels = evt.y + decalY;
            }

            // Ajout à la scène principale de la fonction permettant de relacher le bloc
            this.scene.scene.onPointerUp = (evt:IPointerEvent) => {
                if (!isDragging) return;
                this.movable.enableSlotHovering();
                isDragging = false;
                if (this.movable instanceof BlocContainer) {
                    let slot = this.scene.getHoverSlot();
                    if (slot instanceof EmptySlot) slot.replaceIfMatch(this.movable);
                }
                else if (this.movable instanceof InstructionContainer) {
                    let slot = this.scene.getHoverSlot();
                    if (slot instanceof Magnet) {
                        slot.replaceSlot(this.movable);
                    } else {
                        //console.log(this.scene.getHoverSlot());
                    }
                }
            }
        });*/
    }

}


