import * as GUI from "@babylonjs/gui";
import type { Booleen } from "../../Language/Booleen/Booleen";
import { Inf } from "../../Language/Booleen/Inf";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { BooleenContainer } from "../BooleenContainer";
import { isValuable } from "../Valuable";

export class InfContainer extends BooleenContainer {

    constructor(root: GUI.Container, content_root:GUI.Container, scene: GameScene) {
        super(["", "v", " < ", "v"], root, content_root, scene);
        this.shortName = "inf";
    }

    public getValue(): (Booleen)[] {
        let slots = this.getSlots();
        const child1 = slots[0].children[0];
        const child2 = slots[1].children[0];
        if (isValuable(child1) && isValuable(child2)) {
            return [new Inf(child1.getValue()[0], child2.getValue()[0], this)];
        }
        
        throw new Error("Reading a value on a non-value control. Fuck you");
    }
}