import { nanoid } from "nanoid";
import { TypeSpecRegistry } from "./type-registry";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { SceneGraph } from "./graph/scene-graph";
import { NodeInstanceFactory } from "./helpers/node-instance-factory";
import { NodeSceneData, SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";

export class NodeScene {
    scene_id: string
    registry: TypeSpecRegistry

    instance_factory: NodeInstanceFactory
    graph: SceneGraph

    constructor(registry: TypeSpecRegistry, scene_id?: string) {
        this.scene_id = scene_id ? scene_id : nanoid(6);
        this.registry = registry;

        this.instance_factory = new NodeInstanceFactory(this.registry);
        this.graph = new SceneGraph(this.registry);
    }

    public createNode(node_fqn: string, position: Vector2) {
        const instance = this.instance_factory.createNew(node_fqn, position);
        this.graph.addNode(instance);
    }

    public createNodeFromData(node_fqn: string, node_data: NodeSceneData) {
        const instance = this.instance_factory.create(node_fqn, node_data);
        this.graph.addNode(instance);
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

    // TODO:
    // public toSceneData(): SceneData {
    //     let dependencies: Set<PackageManifest> = new Set();
    //     for (const node of Object.values(this.graph.allNodes)) {
    //         const spec = this.registry.getNodeTypeSpec(node.fqn);
            
    //     }

    //     let data: SceneData = {
            
    //     }
    // }
}