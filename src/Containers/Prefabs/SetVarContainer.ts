import * as GUI from "@babylonjs/gui";
import type { Instruction } from "../../Language/Instructions/Instruction";
import { SetVar } from "../../Language/Instructions/SetVar";
import type { GameScene } from "../../MainLoop/Scene/GameScene";
import { InstructionContainer } from "../InstructionContainer";
import { isValuable } from "../Valuable";
import type { ExecutionContext } from "../../MainLoop/ExecutionContext";
import { Memory } from "../../Language/Memory";
import type { InputSlot } from "../InputSlot";

export class SetVarContainer extends InstructionContainer {
    
    name:string;
    private ctx: ExecutionContext;
    private firstSlotSave: GUI.Control | undefined;
    private realName: string;

    constructor(name:string, root: GUI.Container, content_root:GUI.Container, scene: GameScene, ctx: ExecutionContext){
        const realName = "On met la valeur de " + name + " à ";
        super([realName, "a"], root, content_root, scene);
        this.realName = realName;
        this.name = name;
        this.ctx = ctx;
        this.firstSlotSave = this.bloc.getFirstSlot();
    }

    getInstruction(): Instruction {
        const slots = this.getSlots();
        const firstChild = slots[0].children[0];

        if (isValuable(firstChild)) {
            const value = firstChild.getValue()[0];
            return new SetVar(this.name, value, this, this.ctx);
        }

        throw new Error("Reading a value on a non-value control. Fuck you");
    }

    triggerModeUpdate() {
        if (Memory.get().getGameMode() === "PIGMODE") {
            this.bloc.updateFirstLabel("Avancer d'une case");
            this.bloc.clearSlots();
        } else {
            this.bloc.updateFirstLabel(this.realName);
            if (this.firstSlotSave) this.bloc.restoreSlot(this.firstSlotSave);
            else console.error("cannot restore firstslotsave cause she's undefined (yes she's a girl)");
        }
    }

    hasModeUpdateBehavior(): boolean {
        return true;
    }
}