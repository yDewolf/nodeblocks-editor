import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { TypeSpecRegistry } from "../type-registry";

type PackageLoadListener = (packages: string[]) => void;
export class PackageManager {
    public readonly registry: TypeSpecRegistry;

    private _listeners: Set<PackageLoadListener>;

    private _loadedPackages: Record<string, PackageManifest> = {};
    private _nodeToPackageMap: Record<string, string> = {}; // node_fqn -> package_id

    constructor(registry: TypeSpecRegistry) {
        this._listeners = new Set();
        this.registry = registry;
    }

    public reset(): void {
        this._loadedPackages = {};
        this._nodeToPackageMap = {};
        this.registry.reset();
    }

    public subscribePackageLoad(listener: PackageLoadListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    private notifyListeners(loadedPackages: string[]): void {
        this._listeners.forEach((listener) => listener(loadedPackages));
    }

    public loadPackages(packages: PackageManifest[]): void {
        for (const pkg of packages) {
            if (pkg.data_types) {
                for (const dataTypeSpec of Object.values(pkg.data_types)) {
                    dataTypeSpec.fqn = `${dataTypeSpec.namespace}:${dataTypeSpec.id}`
                    if (!this.registry.isDataTypeRegistered(dataTypeSpec.fqn)) {
                        this.registry.registerDataType(dataTypeSpec);
                    }
                }
            }

            if (pkg.node_types) {
                for (const nodeSpec of Object.values(pkg.node_types)) {
                    nodeSpec.fqn = `${nodeSpec.namespace}:${nodeSpec.id}`
                    if (!this.registry.isNodeTypeRegistered(nodeSpec.fqn)) {
                        this.registry.registerNodeType(nodeSpec);
                    }
                    this._nodeToPackageMap[nodeSpec.fqn] = pkg.package_id;
                }
            }

            this._loadedPackages[pkg.package_id] = pkg;
        }
        this.notifyListeners(Object.keys(this._loadedPackages));
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
