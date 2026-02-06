import { Vector3, type TransformNode } from "@babylonjs/core";
import type { AssetLibrary } from "../Shared/AssetLibrary";

export class Entity {
    protected mesh : TransformNode;

    constructor(drh : AssetLibrary, assetName : string, pos : Vector3) {
        this.mesh = drh.createSingleInstance(assetName, pos);
    }

    move(dpos : Vector3) {
        this.mesh.position.add(dpos);
    }

    moveX(dx : number) {
        this.mesh.position.add(new Vector3(dx, 0, 0));
    }

    moveY(dy : number) {
        this.mesh.position.add(new Vector3(0, dy, 0));
    }

    moveZ(dz : number) {
        this.mesh.position.add(new Vector3(0, 0, dz));
    }
}