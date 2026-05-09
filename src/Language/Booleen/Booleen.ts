import type { BlocContainer } from "../../Containers/BlocContainer";
import { Bloc } from "../Bloc";

export abstract class Booleen extends Bloc {
    protected container: BlocContainer;
    abstract eval(): boolean;
    public getContainer() : BlocContainer {return this.container;}
}