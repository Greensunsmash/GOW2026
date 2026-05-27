/*
Ptite explication sur les LayerMasks

Vu qu'on a notre écran divisé en deux,
et qu'on a une caméra pour chaque partie,
par défaut Babylon render quand meme les objets de la partie de gauche
sur la caméra de la partie de droite, et inversement.

Du coup on se retrouve avec deux interfaces duppliquées, et deux scènes 3D affichées.

Pour pallier ça, on doit indiquer à Babylone
que tel objet doit être render UNIQUEMENT par une caméra donnée.
Pour tester si un objet doit être render par une caméra, Babylone fait le test :
(layerMaskCamera & layerMaskObjet) != 0
*/
export class LayerMasks {
    static readonly ALL = 0xFFFFFFFF;
    static readonly UI_ONLY = 0x10000000;
    static readonly SCENE_ONLY = 0xFFFFFFFF ^ LayerMasks.UI_ONLY; 
}

export let ASSETS_ROOT = import.meta.env.BASE_URL + "./assets/";

export const INTRO_LEVELS = ["level1.json", "level2.json"];