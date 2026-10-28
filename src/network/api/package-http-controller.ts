import { PackageManager } from "~/feature/editor/engine/packages/package-manager";
import { AppSessionManager } from "../app-session-manager";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";

export class PackageManagerHTTPController {
    constructor(
        private readonly appSession: AppSessionManager,
    ) {

    }

    public async fetchAndLoadManifests(packageManager: PackageManager): Promise<void> {
        const response = await fetch(`${this.appSession.baseHttpUrl}/api/plugins/manifests`);
        if (!response.ok) {
            throw new Error("Failed to fetch package manifests");
        }

        const json_data = await response.json();
        const manifests: PackageManifest[] = json_data.loaded_manifests;
        
        packageManager.loadPackages(manifests);
        // console.log("[SceneConnection] Loaded manifests: ", manifests);
    }
}