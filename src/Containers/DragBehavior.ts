import * as GUI from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import type { IPointerEvent} from "babylonjs";
import { InstructionContainer } from "./InstructionContainer";

// Cette classe permet à une control de pouvoir être drag'n'drop
export class DragBehavior {

    private target: BlocContainer | InstructionContainer;
    private scene: GameScene;

    constructor(target: BlocContainer | InstructionContainer) {
        this.target = target;
        this.scene = target.getScene();
        this.init();
    }

    // Init (création des lambdas responsables du comportement)
    private init(): void {
        let isDragging = false;
        let decalX = 0;
        let decalY = 0;

        // Ajout d'une fonction qui sera appellée lorsqu'on appuie sur le control
        this.target.onPointerDownObservable.add((pointerInfo) => {

            const parent = this.target.parent;

            // Si jamais la fonction appartient déjà à un BlocContainer (on le décroche)
            if (parent instanceof GUI.Rectangle && this.target instanceof BlocContainer) {
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

            if (parent instanceof InstructionContainer && this.target instanceof InstructionContainer) {
                parent.removeNext();
            }
            isDragging = true;

            decalX = this.target.leftInPixels - pointerInfo.x;
            decalY = this.target.topInPixels - pointerInfo.y;

            // Ajout à la scène principale de la fonction permettant de déplacer le bloc 
            this.scene.scene.onPointerMove = (evt:IPointerEvent) => {
                if (!isDragging) return;
                this.target.leftInPixels = evt.x + decalX;
                this.target.topInPixels = evt.y + decalY;
            }

            // Ajout à la scène principale de la fonction permettant de relacher le bloc
            this.scene.scene.onPointerUp = (evt:IPointerEvent) => {
                if (!isDragging) return;
                isDragging = false;
                if (this.target instanceof BlocContainer) this.scene.hoverSlot?.replaceIfMatch(this.target);
            }
        });

        /*
        this.target.onPointerUpObservable.add(() => {
            isDragging = false;
            this.scene.hoverSlot?.replaceSlot(this.target);
        }); */
    }
}


