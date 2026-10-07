import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { NodeInstance } from "../graph/node-instance";
import { TypeSpecRegistry } from "../type-registry";

export class PackageManager {
    public readonly registry: TypeSpecRegistry;

    private _loadedPackages: Record<string, PackageManifest> = {};
    private _nodeToPackageMap: Record<string, string> = {}; // node_fqn -> package_id

    constructor(registry: TypeSpecRegistry) {
        this.registry = registry;
    }

    public reset(): void {
        this._loadedPackages = {};
        this._nodeToPackageMap = {};
        this.registry.reset();
    }

    public loadPackages(packages: PackageManifest[]): void {
        for (const pkg of packages) {
            if (pkg.data_types) {
                for (const dataTypeSpec of Object.values(pkg.data_types)) {
                    if (!this.registry.isDataTypeRegistered(dataTypeSpec.fqn)) {
                        this.registry.registerDataType(dataTypeSpec);
                    }
                }
            }

            if (pkg.node_types) {
                for (const nodeSpec of Object.values(pkg.node_types)) {
                    if (!this.registry.isNodeTypeRegistered(nodeSpec.fqn)) {
                        this.registry.registerNodeType(nodeSpec);
                    }
                    this._nodeToPackageMap[nodeSpec.fqn] = pkg.package_id;
                }
            }

            this._loadedPackages[pkg.package_id] = pkg;
        }
    }


    public isPackageLoaded(packageId: string): boolean {
        return packageId in this._loadedPackages;
    }

    public getPackage(packageId: string): PackageManifest | undefined {
        return this._loadedPackages[packageId];
    }

    public getAllPackages(): Record<string, PackageManifest> {
        return { ...this._loadedPackages };
    }

    public getAvailableNodeSpecs(): NodeTypeSpec[] {
        return Object.values(this.registry.nodeTypes);
    }


    public getPackageIdForNode(nodeFqn: string): string | undefined {
        return this._nodeToPackageMap[nodeFqn];
    }
}
