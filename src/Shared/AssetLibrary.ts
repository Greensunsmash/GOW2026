import { AbstractMesh, AssetContainer, Color3, LoadAssetContainerAsync, MeshBlock, MeshBuilder, TransformNode, Vector3, type AnimationGroup, type Scene } from "@babylonjs/core";
import { ASSETS_ROOT, LayerMasks } from "./Constants";
import "@babylonjs/loaders";
import type { PlayScene } from "../MainLoop/Scene/PlayScene";

export class AssetLibrary {
    static MODELS_ROOT = ASSETS_ROOT + "models/";

    private readonly scene: PlayScene;
    private groups: { [key: string] : number } = {};
    private assets: { [key: string]: TransformNode } = {};
    private containers: { [name: string]: AssetContainer } = {};
    private animationGroupsByAsset: { [key: string]: AnimationGroup[] } = {};

    constructor(scene : PlayScene) {
        this.scene = scene;
    }
    
    async loadAsset(name: string, filenames: string[], path: string) {
        for (let i = 1; i <= filenames.length; i++) {
            await this.loadSingleAsset(`${name}-${i}`, filenames[i - 1], path);
        }
    }

    async loadSingleAsset(
        name: string,
        filename: string
    ): Promise<TransformNode> {
        if (this.assets[name]) {
            return this.assets[name];
        }

        try {
            const container = await LoadAssetContainerAsync(AssetLibrary.MODELS_ROOT + filename, this.scene.scene);
            /*const rootMesh = new TransformNode(name, this.scene.scene);

            container.meshes.forEach(mesh => {
                mesh.parent = rootMesh;
                mesh.isVisible = true;
                mesh.layerMask = LayerMasks.SCENE_ONLY;
            });

            rootMesh.setEnabled(false);

            this.assets[name] = rootMesh;*/
            this.containers[name] = container;
            this.assets[name] = container.rootNodes[0] as TransformNode;
            this.animationGroupsByAsset[name] = container.animationGroups;

            return this.assets[name];
        } catch (err) {
            console.error(`Failed to load asset '${name}' from '${AssetLibrary.MODELS_ROOT}${filename}'`, err);
            throw new Error(`Failed to load asset '${name}': ${err}`);
        }
    }

    private getInGroupId(group: string) {
        let n = this.groups[group];
        if (n == null) {
            this.groups[group] = 1;
        } else {
            this.groups[group]++;
        }
        return group + "-" + this.groups[group];
    }

    createSingleInstance(
        name: string,
        position: Vector3,
        fitInCube?: boolean,
        scaleFactor?: number
    ): TransformNode {
        console.log("creating new ", name, " instnace");

        const container = this.containers[name];
        if (!container) throw new Error(`asset '${name}' container not found.`);

        const instantiatedEntries = container.instantiateModelsToScene(
            nameFunction => `${name}_instance_${nameFunction}`, 
            false, 
            { doNotInstantiate: true }
        );

        console.log(instantiatedEntries);
        let instance = instantiatedEntries.rootNodes[0] as TransformNode;
        instance.parent = null; 
        instance.setEnabled(true);

        const newAnimations = instantiatedEntries.animationGroups;
        (instance as any).animations = newAnimations; 

        let childMeshes = instance.getChildMeshes();
        childMeshes.forEach((mesh) => (mesh.isVisible = true));
        /*
        if (childMeshes.length === 0)
            childMeshes = [instance]; */

        childMeshes.forEach((mesh) => (mesh.isVisible = true));

        let minX = Number.MAX_VALUE,
        maxX = -Number.MAX_VALUE;
        let minY = Number.MAX_VALUE,
        maxY = -Number.MAX_VALUE;
        let minZ = Number.MAX_VALUE,
        maxZ = -Number.MAX_VALUE;

        let centerOffset = Vector3.Zero();
        childMeshes.forEach(mesh => { 
            //this.scene.shadowGenerator.addShadowCaster(mesh);
            mesh.computeWorldMatrix(true);
            mesh.refreshBoundingInfo({});
            const bbox = mesh.getBoundingInfo().boundingBox;
            centerOffset.addInPlace(bbox.centerWorld);

            minX = Math.min(minX, bbox.minimumWorld.x);
            maxX = Math.max(maxX, bbox.maximumWorld.x);
            minY = Math.min(minY, bbox.minimumWorld.y);
            maxY = Math.max(maxY, bbox.maximumWorld.y);
            minZ = Math.min(minZ, bbox.minimumWorld.z);
            maxZ = Math.max(maxZ, bbox.maximumWorld.z);
        });
        centerOffset.scaleInPlace(1 / childMeshes.length); 

        let sizeX = maxX - minX;
        let sizeZ = maxZ - minZ;
        let sizeY = maxY - minY;

        let scaleX = 1 / sizeX;
        let scaleY = 1 / sizeY;
        let scaleZ = 1 / sizeZ;

        if (scaleFactor)
            instance.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        else {
            if (fitInCube)
                instance.scaling = new Vector3(scaleX, scaleY, scaleZ);
            else {
                const scale = Math.min(scaleX, scaleY, scaleZ);
                instance.scaling = new Vector3(scale, scale, scale);
            }
        }

        const pivotPos = instance.getAbsolutePosition();
        const offsetToCenter = centerOffset.subtract(pivotPos);
        const offsetToBottom = minY - pivotPos.y;

        instance.position.x = position.x - (offsetToCenter.x * instance.scaling.x);
        instance.position.z = position.z - (offsetToCenter.z * instance.scaling.z);

        instance.position.y = position.y - (offsetToBottom * instance.scaling.y);

        instance.rotation = Vector3.Zero();

        //instance.receiveShadows = true;

        return instance;
    }

    getAnimations(key: string) {
        return this.animationGroupsByAsset[key];
    }

    printLoadedAssets() {
        console.log(this.assets);
    }

}