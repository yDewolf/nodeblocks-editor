import { PackageManager } from "~/feature/editor/engine/packages/package-manager";
import { AppSessionManager } from "../app-session-manager";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";

export class PackageManagerHTTPController {
    constructor(
        private readonly appSession: AppSessionManager,
    ) {

    }

    // FIXME: provavelmente existe algum bug escondido relacionado à forma como fazemos fetch aqui
    // principalmente porque o PackageManager mantém todos os pacotes que ele carregou
    public async fetchAndLoadManifests(packageManager: PackageManager): Promise<void> {
        try {
            const response = await fetch(`${this.appSession.baseHttpUrl}/api/plugins/manifests`, {
                headers: {
                    "Content-Type": "application/json",
                    ...this.appSession.defaultHeaders,
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch package manifests");
            }
    
            const json_data = await response.json();
            const manifests: PackageManifest[] = json_data.loaded_manifests;
            
            packageManager.loadPackages(manifests);
        } catch (err) {
            console.error("Failed to fetch package manifests", err);
        }
    }
}