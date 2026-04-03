import { Accessor, createSignal } from "solid-js";
import { Vector2 } from '~/data_types/geometry';
import { BaseNode } from './base-node';
import { BaseNodeConstructor, CustomNodeConstructor } from "~/helpers/node-constructor";
import { NodeTypeFile } from "~/helpers/node-type-file";

export class NodeController {
    private _nodes: () => BaseNode[];
    private _setNodes: (val: BaseNode[]) => void;

    private node_constructors: Map<string, BaseNodeConstructor>;
    selected_constructor: string = "default";

    get nodes() { return this._nodes() }
    private set nodes(value: BaseNode[]) { this._setNodes(value); }

    constructor() {
        this.node_constructors = new Map();
        this.node_constructors.set("default", new BaseNodeConstructor("default"))

        const [nodes, setNodes] = createSignal<BaseNode[]>([])
        this._nodes = nodes;
        this._setNodes = setNodes;
    }
        
    public clear() {
        this._setNodes([]);
    }


    public get_node(id: string): BaseNode {
        const filtered = this.nodes.filter((node) => node.id == id);
        return filtered[0];
    }

    public add_new_node(name: string, pos: Vector2) {
        // const new_node = new BaseNode(name, pos, this._increment_last_id())
        // this._setNodes([...this._nodes(), new_node]);
        const construct = this.node_constructors.get(this.selected_constructor);
        if (!construct) {
            console.error("Couldn't find constructor for", this.selected_constructor, "type");
            return;
        }
        const new_id = crypto.randomUUID();
        const new_node = construct.make_node(name != "" ? name : construct.type_name, pos, new_id);
        this.nodes = [...this.nodes, new_node];
    }

    public add_node(node: BaseNode) {
        // FIXME: Nem sempre o id dos nodes vai ficar certo se você for "importar uma cena"
        this.nodes = [...this.nodes, node];
    }

    public remove_node(node: BaseNode) {
        // TODO: Make this signal based (node.free() emits a signal that removes the node everywhere)
        this.nodes = this.nodes.filter((_node) => _node != node)
    }

    public load_node_types(node_file: NodeTypeFile) {
        this.node_constructors = node_file.node_constructors;
        this.selected_constructor = node_file.node_constructors.keys().toArray()[0];

        this.nodes = [];
    }
}