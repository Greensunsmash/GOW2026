import { Value } from "./Value";
import { Bloc } from "../Bloc";


export abstract class Valeur extends Bloc {
    abstract eval(): Value;
}