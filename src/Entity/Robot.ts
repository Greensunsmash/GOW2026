import { Vector3 } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";
import { Entity } from "./Entity";

export class Robot extends Entity {
    constructor(drh : AssetLibrary, pos : Vector3) {
       super(drh, "robot", pos);
    }
}