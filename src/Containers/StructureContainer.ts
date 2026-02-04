
import { InstructionContainer } from "./InstructionContainer";

export class StructureContainer extends InstructionContainer {

    addNext(c : InstructionContainer): void {
        super.addNext(c);
        c.paddingLeftInPixels = 20;
    }

    removeNext(): void {
        let c = this.getNext();
        if (c !== null) c.paddingLeftInPixels = 0;
        super.removeNext();
    }
}