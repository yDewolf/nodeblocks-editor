import { createSignal } from "solid-js";
import { Vector2 } from '~/wrapper/data_types/geometry';
import { GraphNode } from '../nodes/graph-node';
import { BaseNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeTypeFile } from "~/wrapper/helpers/node-type-file";
import { Action } from "~/network/controllers/actions/action-controller";
import { NodeActionPayload, NodeSceneRequestData } from "~/network/websocket/request-types";
import { SceneActionTypes } from "~/network/websocket/websocket-protocol";

export class NodeController {
    private _nodes: () => GraphNode[];
    private _setNodes: (val: GraphNode[]) => void;

    private _free_queue: Map<Action<NodeActionPayload>, GraphNode> = new Map();;

    private node_constructors: Map<string, BaseNodeConstructor>;

    get nodes() { return this._nodes() }
    private set nodes(value: GraphNode[]) { this._setNodes(value); }

    constructor() {
        this.node_constructors = new Map();
        this.node_constructors.set("default", new BaseNodeConstructor("default"))

        const [nodes, setNodes] = createSignal<GraphNode[]>([])
        this._nodes = nodes;
        this._setNodes = setNodes;
    }

    public load_node_types(node_file: NodeTypeFile) {
        this.node_constructors = node_file.node_constructors;
        this.nodes = [];
    }
        
    public clear() {
        this._setNodes([]);
    }

    public get_node(id: string): GraphNode | null {
        const filtered = this.nodes.filter((node) => node.id == id);
        if (!filtered) {
            return null;
        }

        return filtered[0];
    }

    public create_node(name: string, pos: Vector2, node_type: string, uid: string | undefined = undefined, node_data: Map<string, any> | undefined = undefined): GraphNode | null {
        const construct = this.node_constructors.get(node_type);
        if (!construct) {
            console.error("Couldn't find constructor for", node_type, "type");
            return null;
        }

        const node_id = uid == undefined ? crypto.randomUUID() : uid;
        const new_node = construct.make_node(
            name != "" ? name : construct.type_name, 
            pos, 
            node_id,
            node_data
        );
        return new_node;
    }

    public add_node(node: GraphNode): boolean {
        if (this.get_node(node.id) != null || this.nodes.includes(node)) {
            return false;
        }
        this.nodes = [...this.nodes, node];
        return true;
    }

    protected free_node(node: GraphNode) {
        // TODO: Make this signal based (node.free() emits a signal that removes the node everywhere)
        this.nodes = this.nodes.filter((_node) => _node != node)
    }

    public sync_free(action: Action<NodeActionPayload>) {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return;
        
        action.request.payload.uids.forEach((uid) => {
            const node = this.get_node(uid);
            if (node) {
                this.free_node(node);
            }
        });
        this._free_queue.delete(action);
    }

    public queue_free_nodes(nodes: GraphNode[], ref_action: Action<NodeActionPayload>) {
        nodes.forEach((node) => {
            this._free_queue.set(ref_action, node);
        });
    }

    public add_nodes_unsynced(nodes_data: NodeSceneRequestData): Array<GraphNode> {
        let nodes: Array<GraphNode> = new Array();
        Object.entries(nodes_data).forEach(([uid, node_data]) => {
            let data = node_data.data;
            if (!(data instanceof Map)) {
                Object.fromEntries(Object.entries(data).map(([key, value]: [string, any]) => {
                    return [key, {...value}]
                }));
            }
            if (data instanceof Map) {
                const new_node = this.create_node(
                    "", node_data.position, node_data.type, uid, data
                );
                if (new_node) { 
                    this.add_node(new_node); 
                    nodes.push(new_node);
                }
            }
        });
        return nodes
    }
}