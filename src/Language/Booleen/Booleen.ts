import { Bloc } from "../Bloc";

export abstract class Booleen extends Bloc {
    abstract eval(): boolean;
}