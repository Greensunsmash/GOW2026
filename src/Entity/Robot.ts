import { KeyboardEventTypes, Scene, Vector3 } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { GridEntity } from "./GridEntity";
import type { Level } from "../Environment/Level";
import type { GridPoint } from "../Shared/GridUtils";

export class Robot extends GridEntity {
    private speed : number = 0.1;

    constructor(drh : AssetLibrary, scene : Scene, level : Level, gridPos : GridPoint) {
       super(drh, "robot", level, gridPos);
       this.setupInput(scene);
    }

    setupInput(scene : Scene) {
       scene.onKeyboardObservable.add((kbInfo) => {
            if (this._isMoving) return; 

            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                const key = kbInfo.event.key.toLowerCase();
                
                /*
                if (key === "z" || key === "arrowup")    this.tryMove(0, 1);
                if (key === "s" || key === "arrowdown")  this.tryMove(0, -1);
                if (key === "q" || key === "arrowleft")  this.tryMove(-1, 0);
                if (key === "d" || key === "arrowright") this.tryMove(1, 0);

                INTERDIT.
                Dans ce monde cruel, on ne se déplace que vers l'avant, et en tournant.
                A vos marques,
                prêts,...
                            ✨ ROTATEZ !! ✨
                */

                if (key === "z") this.moveForward();
                if (key === "s") this.moveBackward();
                if (key === "d") this.turnRight();
                if (key === "q") this.turnLeft();
            }
        });
    }
}