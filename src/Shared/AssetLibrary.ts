import { LoadAssetContainerAsync, MeshBlock, MeshBuilder, TransformNode, Vector3, type AnimationGroup, type Scene } from "@babylonjs/core";
import { ASSETS_ROOT, LayerMasks } from "./Constants";
import "@babylonjs/loaders";

export class AssetLibrary {
    static MODELS_ROOT = ASSETS_ROOT + "models/";

    private readonly scene: Scene;
    private groups: { [key: string] : number } = {};
    private assets: { [key: string]: TransformNode } = {};
    private animationGroupsByAsset: { [key: string]: AnimationGroup[] } = {};

    constructor(scene : Scene) {
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
            const container = await LoadAssetContainerAsync(AssetLibrary.MODELS_ROOT + filename, this.scene);
            const rootMesh = new TransformNode(name, this.scene);

            container.meshes.forEach(mesh => {
                mesh.parent = rootMesh;
                mesh.isVisible = true;
                mesh.layerMask = LayerMasks.SCENE_ONLY;
            });

            rootMesh.setEnabled(false);

            this.assets[name] = rootMesh;
            this.animationGroupsByAsset[name] = container.animationGroups;

            return rootMesh;
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
        rotation: Vector3 = new Vector3(0,0,0),
        scaleFactor: number = 1.0
    ): TransformNode {
        if (!this.assets[name])
            throw new Error(`Asset '${name}' instance could not be loaded.`);

        let rootMesh = this.assets[name];
        let instance = rootMesh.clone(`${name}_instance`, null); 

        if (!instance)
            throw new Error(`Asset '${name}' instance could not be cloned.`);
        instance.parent = null; // mon seul parent, c'est la scène - Dalida
        instance.setEnabled(true);

        let childMeshes = instance.getChildMeshes();
        if (childMeshes.length === 0)
            childMeshes = [instance];

        childMeshes.forEach((mesh) => (mesh.isVisible = true));

        let minX = Number.MAX_VALUE,
        maxX = Number.MIN_VALUE;
        let minY = Number.MAX_VALUE,
        maxY = Number.MIN_VALUE;
        let minZ = Number.MAX_VALUE,
        maxZ = Number.MIN_VALUE;

        let centerOffset = Vector3.Zero();
        childMeshes.forEach(mesh => {
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

        instance.scaling = new Vector3(scaleX * scaleFactor, scaleY * scaleFactor, scaleZ * scaleFactor);
        instance.position = position.clone().subtract(centerOffset.subtract(instance.getAbsolutePosition()));
        instance.position.y = position.y; // coller au sol !
        instance.rotation = rotation;

        return instance;
    }

    printLoadedAssets() {
        console.log(this.assets);
    }
}