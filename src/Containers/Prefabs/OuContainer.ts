import type { Container } from "@babylonjs/gui";
import { Booleen } from "../../Language/Booleen/Booleen";
import { Ou } from "../../Language/Booleen/Ou";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { BooleenContainer } from "../BooleenContainer";
import { isValuable } from "../Valuable";

export class OuContainer extends BooleenContainer {

    constructor(root: Container, content_root:Container, scene: GameScene) {
        super(["", "b", " ou ", "b"], root, content_root, scene);
    }

    public getValue(): (Booleen)[] {
        let slots = this.getSlots();
        const child1 = slots[0].children[0];
        const child2 = slots[1].children[0];
        if (isValuable(child1) && isValuable(child2)) {
            const b1 = child1.getValue()[0] as Booleen;
            const b2 = child2.getValue()[0] as Booleen;
            return [new Ou(b1, b2, this)];
        }
        
        throw new Error("Reading a value on a non-value control. Fuck you");
    }
}