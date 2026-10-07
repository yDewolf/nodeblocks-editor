import { nanoid } from "nanoid";
import { TypeSpecRegistry } from "./type-registry";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { SceneGraph } from "./graph/scene-graph";
import { NodeSceneData, SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { INodeProvider } from "./interfaces/node-provider-interface";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { NodeInstance } from "./graph/node-instance";

export class NodeScene {
    scene_id: string
    registry: TypeSpecRegistry

    node_provider: INodeProvider
    graph: SceneGraph

    constructor(registry: TypeSpecRegistry, node_provider: INodeProvider, scene_id?: string) {
        this.scene_id = scene_id ? scene_id : nanoid(6);
        this.registry = registry;

        this.node_provider = node_provider;
        this.graph = new SceneGraph(this.registry);
    }

    public createNode(node_fqn: string, position: Vector2): NodeInstance {
        const instance = this.node_provider.createNode(node_fqn, position);
        this.graph.addNode(instance);
        return instance;
    }

    public createNodeFromData(node_fqn: string, node_data: NodeSceneData): NodeInstance {
        const instance = this.node_provider.createNodeFromData(node_fqn, node_data);
        this.graph.addNode(instance);
        return instance;
    }

    public removeNode(node_id: string): boolean {
        return this.graph.removeNode(node_id);
    }


    public loadFromSceneData(scene_data: SceneData, override: boolean = true) {
        // TODO validate scene
        if (override) {
            this.graph.resetGraph();
        }

        for (const node_data of Object.values(scene_data.nodes)) {
            this.createNodeFromData(node_data.nodetype_fqn, node_data);
        }

        for (const conn_data of Object.values(scene_data.connections)) {
            this.graph.addConnection(conn_data);
        }
    }

    public toSceneData(): SceneData {
        let extracted_dependencies: Set<PackageManifest> = new Set();
        for (const node of Object.values(this.graph.allNodes)) {
            extracted_dependencies.union(this.node_provider.extract_node_dependencies(node));            
        }

        let dependency_map: Record<string, string> = {}
        for (const manifest of extracted_dependencies) {
            dependency_map[manifest.package_id] = manifest.version;
        }

        return {
            uid: this.scene_id,
            dependencies: dependency_map,
            nodes: this.graph.getNodesAsData(),
            connections: this.graph.getConnsAsData()
        }
    }
}