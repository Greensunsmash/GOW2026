import type { Booleen } from "../Language/Booleen/Booleen";
import type { Valeur } from "../Language/Valeur/Valeur";

export interface Valuable {
    getValue(): Valeur[] | Booleen[]
}

export function isValuable(control: any): control is Valuable {
    return control && typeof control.getValue === "function";
}