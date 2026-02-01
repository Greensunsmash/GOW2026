import { Bloc } from "../Bloc";
import type { Executable } from "../Executable";

export abstract class Instruction extends Bloc implements Executable {
    abstract execute(): void;
}
