import { nanoid } from "nanoid";
import { TypeSpecRegistry } from "./type-registry";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { SceneGraph } from "./graph/scene-graph";
import { ConnectionSceneData, NodeSceneData, SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { INodeProvider } from "./interfaces/node-provider-interface";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { NodeInstance } from "./graph/node-instance";

export type SceneEvent =
  | { type: "node_added"; node: NodeInstance }
  | { type: "node_removed"; node_id: string }
  | { type: "conn_added"; conn: ConnectionSceneData }
  | { type: "conn_removed"; conn_id: string };

type SceneEventListener = (event: SceneEvent) => void;

export class NodeScene {
    scene_id: string
    registry: TypeSpecRegistry

    node_provider: INodeProvider
    graph: SceneGraph

    private _listeners: Set<SceneEventListener> = new Set();

    constructor(registry: TypeSpecRegistry, node_provider: INodeProvider, scene_id?: string) {
        this.scene_id = scene_id ? scene_id : nanoid(6);
        this.registry = registry;

        this.node_provider = node_provider;
        this.graph = new SceneGraph(this.registry);
    }

    // Events

    public subscribe(listener: SceneEventListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    private emit(event: SceneEvent): void {
        this._listeners.forEach((listener) => listener(event));
    }

    // Node Methods

    public createNode(node_fqn: string, position: Vector2): NodeInstance {
        const instance = this.node_provider.createNode(node_fqn, position);
        this.addNode(instance);
        return instance;
    }

    public createNodeFromData(node_fqn: string, node_data: NodeSceneData): NodeInstance {
        const instance = this.node_provider.createNodeFromData(node_fqn, node_data);
        this.addNode(instance);
        return instance;
    }

    public removeNode(node_id: string): boolean {
        const removed = this.graph.removeNode(node_id);
        if (removed) {
            this.emit({type: "node_removed", node_id: node_id});
        }
        return removed;
    }

    public addNode(instance: NodeInstance) {
        this.graph.addNode(instance);
        this.emit({type: "node_added", node: instance});
    }

    // Connection stuff

    public addConnection(conn: ConnectionSceneData) {
        const conn_data = this.graph.addConnection(conn);
        if (conn_data) {
            this.emit({type: "conn_added", conn: conn_data});
        }
    }

    public removeConnection(conn_id: string) {
        const disconnected = this.graph.disconnect(conn_id);
        if (disconnected) {
            this.emit({type: "conn_removed", conn_id: conn_id});
        }
        return disconnected;
    }

    // Scene Data Stuff

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