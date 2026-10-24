import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { NodeInstance } from "../graph/node-instance";
import { INodeProvider } from "../interfaces/node-provider-interface";
import { PackageManager } from "../packages/package-manager";
import { NodeInstanceFactory } from "../helpers/node-instance-factory";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { NodeTypeHelper } from "../helpers/nodetype-helper";

export class PackageNodeProvider implements INodeProvider {
    package_manager: PackageManager
    instance_factory: NodeInstanceFactory

    constructor(package_manager: PackageManager) {
        this.package_manager = package_manager;
        this.instance_factory = new NodeInstanceFactory(this.package_manager.registry);
    }

    public createNode(nodetype_fqn: string, position: Vector2): NodeInstance {
        return this.instance_factory.createNew(nodetype_fqn, position);
    }
    
    public createNodeFromData(nodetype_fqn: string, node_scene_data: NodeSceneData): NodeInstance {
        return this.instance_factory.create(nodetype_fqn, node_scene_data);
    }

    public extract_node_dependencies(node: NodeInstance): Set<PackageManifest> {
        let dependencies: Set<PackageManifest> = new Set();
        const spec = this.package_manager.registry.getNodeTypeSpec(node.fqn);
        
        const datatype_dependencies = NodeTypeHelper.extract_datatype_dependencies(spec);
        for (const fqn of datatype_dependencies) {
            const dt_spec = this.package_manager.registry.getDataTypeSpec(fqn);
            const dt_package = this.package_manager.getPackage(spec.namespace);
            if (dt_package) {
                dependencies.add(dt_package);
            }
        }

        return dependencies;
    }
}