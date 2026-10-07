import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { NodeInstance } from "../graph/node-instance";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

export interface INodeProvider {
    createNodeFromData(nodetype_fqn: string, node_scene_data?: NodeSceneData): NodeInstance;
    createNode(nodetype_fqn: string, position: Vector2): NodeInstance;

    extract_node_dependencies(node: NodeInstance): Set<PackageManifest>;
}