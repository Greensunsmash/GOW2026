import { Valeur } from "./Valeur";
import { Value } from "./Value";

export class ValeurBrute extends Valeur {
    private value: Value;

    constructor(value: number | string) {
        super();
        this.value = new Value(value);
    }

    eval(): Value {
        return this.value;
    }
}
