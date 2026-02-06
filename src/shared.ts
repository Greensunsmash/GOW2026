export class LayerMasks {
    static readonly ALL = 0xFFFFFFFF;
    static readonly UI_ONLY = 0x10000000;
    static readonly SCENE_ONLY = 0xFFFFFFFF ^ LayerMasks.UI_ONLY; 
}