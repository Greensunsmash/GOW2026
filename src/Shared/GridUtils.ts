import { Vector3 } from "@babylonjs/core";

// Représente les coordonnées d'une "tile"
// dans le monde 3D
// On utilise pas directement des Vector3 
// dans notre logique interne (genre isWalkable, etc.)
// afin de pouvoir travailler sur des valeurs entières
export interface GridPoint {x: number, y: number, z: number};

/*
Classe utilitaire
pour passer de notre GridPoint à un Vector3,
et aussi pour faire des op.s sur nos GridPoint
*/
export class GridUtils {
    // Vec3 -> Grid Point
    // (Convertit chaque coord. en int)
    static toGrid(pos: Vector3): GridPoint {
        return {
            x: Math.round(pos.x),
            y: Math.round(pos.y),
            z: Math.round(pos.z)
        }
    }

    // Grid Point -> Vector3
    static toWorld(gridpos: GridPoint) : Vector3 {
        return new Vector3(gridpos.x, gridpos.y, gridpos.z);
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

    // Utile pour l'orientation des entités
    static DIRECTIONS : GridPoint[] = [
        { x: 0, y: 0, z: 1 },  // 0: HAUT 
        { x: 1, y: 0, z:0 },  // 1: DROITE 
        { x: 0, y: 0, z:-1 }, // 2: BAS 
        { x: -1, y: 0, z:0 }  // 3: GAUCHE
    ];
}