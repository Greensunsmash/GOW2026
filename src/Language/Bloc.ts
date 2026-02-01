import type { Launchable } from "./Launchable";

export abstract class Bloc {
    onLaunch(l: Launchable): boolean {
        return true;
    }
}