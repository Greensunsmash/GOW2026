import type { Container } from "@babylonjs/gui";
import { Booleen } from "../../Language/Booleen/Booleen";
import { Not } from "../../Language/Booleen/Not";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { BooleenContainer } from "../BooleenContainer";
import { isValuable } from "../Valuable";

export class NotContainer extends BooleenContainer {

    constructor(root: Container, content_root:Container, scene: GameScene) {
        super(["Non ", "b"], root, content_root, scene);
    }

    public getValue(): (Booleen)[] {
        let slots = this.getSlots();
        const child = slots[0].children[0];
        if (isValuable(child)) {
            return [new Not(child.getValue()[0] as Booleen)];
        }
        
        throw new Error("Reading a value on a non-value control. Fuck you");
    }
}