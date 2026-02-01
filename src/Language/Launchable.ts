import { Value } from "./Valeur/Value";

export interface Launchable {
    onLaunch(): boolean;
    execute(list: Value[]): void;
}
