import { createSignal } from "solid-js";
import { Vector2 } from '~/wrapper/data_types/geometry';
import { GraphNode } from '../nodes/graph-node';
import { BaseNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeTypeFile } from "~/wrapper/helpers/node-type-file";

export class NodeController {
    private _nodes: () => GraphNode[];
    private _setNodes: (val: GraphNode[]) => void;

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

    public add_new_node(name: string, pos: Vector2, node_type: string) {
        // const new_node = new BaseNode(name, pos, this._increment_last_id())
        // this._setNodes([...this._nodes(), new_node]);
        const construct = this.node_constructors.get(node_type);
        if (!construct) {
            console.error("Couldn't find constructor for", node_type, "type");
            return;
        }
        const new_id = crypto.randomUUID();
        const new_node = construct.make_node(name != "" ? name : construct.type_name, pos, new_id);
        this.nodes = [...this.nodes, new_node];
    }

    public add_node(node: GraphNode) {
        // FIXME: Nem sempre o id dos nodes vai ficar certo se você for "importar uma cena"
        this.nodes = [...this.nodes, node];
    }

    public remove_node(node: GraphNode) {
        // TODO: Make this signal based (node.free() emits a signal that removes the node everywhere)
        this.nodes = this.nodes.filter((_node) => _node != node)
    }

    public load_node_types(node_file: NodeTypeFile) {
        this.node_constructors = node_file.node_constructors;
        this.nodes = [];
    }
}