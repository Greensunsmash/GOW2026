import * as GUI from "@babylonjs/gui";
import { KeyboardEventTypes, Vector2 } from "@babylonjs/core";
import { Colors } from "../../Shared/Colors";
import type { BaseScene } from "../../MainLoop/Scene/BaseScene";
import { LevelPopup } from "./LevelPopup";
import { ArchipelTrigger } from "../buttons/ArchipelTrigger";

export class LevelSelectMap extends GUI.Rectangle {
    private readonly scene: BaseScene;
    private readonly root: GUI.AdvancedDynamicTexture;
    private readonly content: GUI.Rectangle;

    private readonly mapWidth = 6000;
    private readonly mapHeight = 4000;

    private isPanning: boolean = false;
    private startPanX: number = 0;
    private startPanY: number = 0;
    private startLeft: number = 0;
    private startTop: number = 0;

    private onPan: (x: number, y: number, scale: number) => void;

    constructor(root: GUI.AdvancedDynamicTexture, scene: BaseScene, onPan: (x: number, y: number, scale: number) => void) {
        super();
        this.scene = scene;
        this.root = root;
        this.onPan = onPan;

        // Propriétés du conteneur parent (la fenêtre de vue)
        this.width = "100%";
        this.height = "100%";
        this.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.background = "#00000000";
        this.clipChildren = true;
        this.isPointerBlocker = true; // IMPORTANT : Bloque le clic pour la GUI

        // Le contenu (la carte qui bouge)
        this.content = new GUI.Rectangle();
        this.content.width = `${this.mapWidth}px`;
        this.content.height = `${this.mapHeight}px`;
        this.content.background = "#ffffff00";
        this.content.color = Colors.MapBackground || "white";
        this.content.thickness = 0;
        this.content.cornerRadius = 22;
        this.content.shadowOffsetX = 1;
        this.content.shadowOffsetY = 1;
        this.content.shadowBlur = 7;
        this.content.shadowColor = "#00000040";
        
        // Alignement OBLIGATOIRE au centre pour que le calcul des limites soit parfaitement symétrique
        this.content.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.content.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        this.content.scaleX = 0.6;
        this.content.scaleY = 0.6;
        this.content.leftInPixels = 1070;
        this.content.topInPixels = -700;
        
        this.addControl(this.content);

        this.scene.scene.onKeyboardObservable.add((kbInfo) => {
                    if (kbInfo.type == KeyboardEventTypes.KEYUP) {
                        console.log("key event", kbInfo.event.key);
                        if (kbInfo.event.key === "g") {
                            console.log(this.content.leftInPixels, this.content.topInPixels);
                        }
                    }});
                
        // -- GESTION DU DRAG (PANNING) VIA LES OBSERVABLES GUI --
        this.onPointerDownObservable.add((pi) => {
            this.isPanning = true;
            this.startPanX = pi.x;
            this.startPanY = pi.y;
            this.startLeft = this.content.leftInPixels;
            this.startTop = this.content.topInPixels;
        });

        this.onPointerMoveObservable.add((pi) => {
            if (!this.isPanning) return;
            
            // Calcul basique du delta de la souris
            const dx = pi.x - this.startPanX;
            const dy = pi.y - this.startPanY;
            
            this.content.leftInPixels = this.startLeft + dx;
            this.content.topInPixels = this.startTop + dy;
            
            // On vérifie immédiatement les limites avant d'afficher
            this.clampContentPosition();
            this.triggerPanCallback();
        });

        const stopPanning = () => { this.isPanning = false; };
        this.onPointerUpObservable.add(stopPanning);
        this.onPointerOutObservable.add(stopPanning);

        // -- GESTION DU ZOOM (WHEEL) --
        const canvas = this.scene.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            canvas.addEventListener("wheel", (evt) => {
                const measure = this._currentMeasure;
                if (!measure) return;
                // Vérifier que la souris est bien dans le rectangle parent
                if (evt.clientX < measure.left || evt.clientX > measure.left + measure.width) return;
                if (evt.clientY < measure.top || evt.clientY > measure.top + measure.height) return;
                
                evt.preventDefault();
                const delta = evt.deltaY > 0 ? -0.05 : 0.05;
                this.zoom(delta);
            }, { passive: false });
        }

        // On force un alignement dès que la GUI a calculé sa taille d'écran réelle
        this.scene.scene.onBeforeRenderObservable.addOnce(() => {
            this.clampContentPosition();
            this.triggerPanCallback();
        });
    }

    private clampContentPosition(): void {
        if (!this._currentMeasure) return; // Sécurité si la GUI n'est pas encore rendue

        const viewportWidth = this._currentMeasure.width;
        const viewportHeight = this._currentMeasure.height;

        const currentScale = this.content.scaleX;
        const scaledWidth = this.mapWidth * currentScale;
        const scaledHeight = this.mapHeight * currentScale;

        // La formule magique : maxLimit est la distance max qu'on peut s'éloigner du centre
        let maxLeft = (scaledWidth - viewportWidth) / 2;
        let maxTop = (scaledHeight - viewportHeight) / 2;

        // Si le contenu est plus petit que l'écran (ne devrait pas arriver avec la protection de zoom)
        // on bloque la valeur à 0 pour le forcer à rester centré.
        if (maxLeft < 0) maxLeft = 0;
        if (maxTop < 0) maxTop = 0;

        // Application stricte des limites
        this.content.leftInPixels = Math.max(-maxLeft, Math.min(maxLeft, this.content.leftInPixels));
        this.content.topInPixels = Math.max(-maxTop, Math.min(maxTop, this.content.topInPixels));
    }

    public target(x:number, y:number) {
        console.log(x, y, this.startLeft, this.startTop)
        this.content.leftInPixels = this.startLeft + x;
        this.content.topInPixels = this.startTop + y;
    }

    public zoom(delta: number) {
        if (!this._currentMeasure) return;

        const viewportWidth = this._currentMeasure.width;
        const viewportHeight = this._currentMeasure.height;

        // On calcule le zoom minimum absolu pour ne jamais voir les bords noirs
        const minScaleX = viewportWidth / this.mapWidth;
        const minScaleY = viewportHeight / this.mapHeight;
        const absoluteMinScale = Math.max(minScaleX, minScaleY, 0.4); 
        
        const maxScale = 1.0; // Zoom max (100% de la texture)

        let newScale = this.content.scaleX + delta;
        newScale = Math.max(absoluteMinScale, Math.min(maxScale, newScale));

        this.content.scaleX = newScale;
        this.content.scaleY = newScale;

        // Après chaque changement de zoom, la taille change, donc on doit revérifier les bords
        this.clampContentPosition();
        this.triggerPanCallback();
    }

    addPopup(x: number, y: number, name: string, callback: () => void) {
        const popup = new LevelPopup(this, name, callback);
        popup.leftInPixels = x;
        popup.topInPixels = y;
        this.content.addControl(popup);
    }

    private triggerPanCallback() {
        if (this.onPan) {
            this.onPan(this.content.leftInPixels, this.content.topInPixels, this.content.scaleX);
        }
    }

    public forceTriggerCallback() {
        this.triggerPanCallback();
    }

    public getContentRoot(): GUI.Rectangle { return this.content; }
}