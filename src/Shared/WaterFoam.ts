import {
    MaterialPluginBase,
    PBRMaterial,
    Texture,
    UniformBuffer
} from "@babylonjs/core";

export class WaterFoamPlugin extends MaterialPluginBase {

    private _foamTexture: Texture | null = null;

    private _foamIntensity = 1.0;
    private _foamThreshold = 0.6;
    private _foamSpeed = 0.02;

    // NEW
    private _edgeIntensity = 2.0;
    private _edgeWidth = 0.15;

    constructor(material: PBRMaterial) {
        super(material, "WaterFoam", 100, {});
        console.log("WaterFoamPlugin loaded");
    }

    set foamTexture(tex: Texture) {
        this._foamTexture = tex;
    }

    set intensity(v: number) {
        this._foamIntensity = v;
    }

    set threshold(v: number) {
        this._foamThreshold = v;
    }

    set speed(v: number) {
        this._foamSpeed = v;
    }

    set edgeIntensity(v: number) {
        this._edgeIntensity = v;
    }

    set edgeWidth(v: number) {
        this._edgeWidth = v;
    }

    prepareDefines(defines: any): void {
        console.log("prepares defined call");
        defines.WATERFOAM = !!this._foamTexture;
    }

    getUniforms() {
        return {
            ubo: [
                { name: "foamIntensity", size: 1, type: "float" },
                { name: "foamThreshold", size: 1, type: "float" },
                { name: "foamSpeed", size: 1, type: "float" },
                { name: "edgeIntensity", size: 1, type: "float" },
                { name: "edgeWidth", size: 1, type: "float" }
            ]
        };
    }

    getSamplers() {
        return ["foamSampler"];
    }

    bindForSubMesh(uniformBuffer: UniformBuffer): void {
        uniformBuffer.updateFloat("foamIntensity", this._foamIntensity);
        uniformBuffer.updateFloat("foamThreshold", this._foamThreshold);
        uniformBuffer.updateFloat("foamSpeed", this._foamSpeed);
        uniformBuffer.updateFloat("edgeIntensity", this._edgeIntensity);
        uniformBuffer.updateFloat("edgeWidth", this._edgeWidth);

        if (this._foamTexture) {
            uniformBuffer.setTexture("foamSampler", this._foamTexture);
        }
    }

    getCustomCode(shaderType: string): any {
        if (shaderType !== "fragment") return null;

        return {
            CUSTOM_FRAGMENT_MAIN_BEGIN: `
                finalColor.rgb = vec3(1.0, 0.0, 0.0);
            `
        };
    }

    isEnabled(): boolean {
        console.log("FOAM isEnabled CHECK");
        return true;
    }
}