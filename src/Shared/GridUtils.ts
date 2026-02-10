import { Vector3 } from "@babylonjs/core";

export interface GridPoint {x: number, y: number, z: number};

export class GridUtils {
    /*
        /!\ ATTENTION !!!
        Avertissement national : 
        !!!! INVERSION DU Y ET DU Z !!!!!
            pour babylon le y est l'axe vertical
            quand on gère par layer 2d comme nous c'est horrible
            de pas avoir les deux coordonées du plan en premier
            donc pour pas qu'on ait vite envie de se pendre
            sur le 5eme etage de la bu
            j'ai inversé.
            (et j'ai précisé partt ou ca a lieu.)
    */

    static toGrid(pos: Vector3): GridPoint {
        return {
            x: Math.round(pos.x),
            y: Math.round(pos.y), // z <-> y
            z: Math.round(pos.z)
        }
    }

    static toWorld(gridpos: GridPoint) : Vector3 {
        return new Vector3(gridpos.x, gridpos.y, gridpos.z); // z <-> y
    }

    static equals(a: GridPoint, b: GridPoint) {
        return (a.x == b.x && a.y == b.y && a.z == b.z);
    }

    static add(a: GridPoint, b: GridPoint) {
        return { x: a.x + b.x, y: a.y + b.y, z : a.z + b.z };
    }

    static toString(gridpos: GridPoint) {
        return "(x=" + gridpos.x + ",y=" + gridpos.y + ",z=" + gridpos.z + ")";
    }

    static DIRECTIONS : GridPoint[] = [
        { x: 0, y: 0, z: 1 },  // 0: HAUT 
        { x: 1, y: 0, z:0 },  // 1: DROITE 
        { x: 0, y: 0, z:-1 }, // 2: BAS 
        { x: -1, y: 0, z:0 }  // 3: GAUCHE
    ];
}