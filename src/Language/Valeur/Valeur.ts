import { Value } from "./Value";
import { Bloc } from "../Bloc";
import type { BlocContainer } from "../../Containers/BlocContainer";


export abstract class Valeur extends Bloc {
    protected container : BlocContainer
    abstract eval(): Value;
    public getContainer() : BlocContainer {return this.container;}
}