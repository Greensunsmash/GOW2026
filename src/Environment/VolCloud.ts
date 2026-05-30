import { Texture, Vector3, Color4, GPUParticleSystem, ParticleSystem, CreateBox } from "@babylonjs/core";

 export class VolCloud {
    constructor() {
        let fogTexture = new Texture("/assets/other/smoke_15.png", this.scene);
        const fountainPos = [new Vector3(0, -1, 0), new Vector3(0, 125, 0)];
        const minEmitOffset = new Vector3(-100, -5, -100);
        const minEmit = [minEmitOffset, nightmareOffset.add(minEmitOffset)];
        const maxEmitOffset = new Vector3(100, 0.5, 100);
        const maxEmit = [maxEmitOffset, nightmareOffset.add(maxEmitOffset)];

        const minColor = [new Color4(0.85, 0.78, 0.85, 0.3), new Color4(0.88, 0.41, 0.28, 0.9)];
        const maxColor = [new Color4(0.95, 0.84, 0.91, 0.35), new Color4(0.98, 0.51, 0.38, 0.95)];

        for (let i = 0; i<2; i++) {
            if (!this.volCloudParticles || !this.volCloudFountain) return;
            if (GPUParticleSystem.IsSupported) {
                this.volCloudParticles[i] = new GPUParticleSystem( `volClouds${i}`, {capacity: 50000}, this.scene);
                this.volCloudParticles[i].activeParticleCount = 8000;
                this.volCloudParticles[i].manualEmitCount = this.volCloudParticles[i].activeParticleCount;
            } else {
                this.volCloudParticles[i] = new ParticleSystem(`volClouds${i}`, 4500, this.scene);
                this.volCloudParticles[i].manualEmitCount = this.volCloudParticles[i].getCapacity();
            }
            this.volCloudParticles[i].minEmitBox = minEmit[i];
            this.volCloudParticles[i].maxEmitBox = maxEmit[i];
            this.volCloudParticles[i].particleTexture = fogTexture.clone();

            this.volCloudFountain[i] = CreateBox(`volCloudsFountain${i}`, {size: .01}, this.scene);
            this.volCloudFountain[i].position = fountainPos[0];
            this.volCloudFountain[i].visibility = 0;
            this.volCloudParticles[i].emitter = this.volCloudFountain[i];

            this.volCloudParticles[i].color1 = minColor[i];
            this.volCloudParticles[i].color2 = maxColor[i];
            this.volCloudParticles[i].colorDead = minColor[i];
            this.volCloudParticles[i].minSize = 3.5;
            this.volCloudParticles[i].maxSize = 5.0;
            this.volCloudParticles[i].minLifeTime = 15;
            this.volCloudParticles[i].maxLifeTime = 15;
            this.volCloudParticles[i].emitRate = 50000;
            this.volCloudParticles[i].blendMode = ParticleSystem.BLENDMODE_STANDARD;
            this.volCloudParticles[i].gravity = new Vector3(0, 0, 0);
            this.volCloudParticles[i].direction1 = new Vector3(2, 0, 0);
            this.volCloudParticles[i].direction2 = new Vector3(12, 0, 0);
            this.volCloudParticles[i].minAngularSpeed = -2;
            this.volCloudParticles[i].maxAngularSpeed = 2;
            this.volCloudParticles[i].minEmitPower = .5;
            this.volCloudParticles[i].maxEmitPower = 1;
            this.volCloudParticles[i].updateSpeed = 0.005;

            this.volCloudParticles[i].start();
        }
        
    }
 }