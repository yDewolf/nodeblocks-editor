import { Accessor, createSignal } from "solid-js";
import { Vector2 } from '~/data_types/geometry';
import { BaseNode } from './base-node';
import { BaseNodeConstructor, CustomNodeConstructor } from "~/helpers/node-constructor";
import { NodeTypeFile } from "~/helpers/node-type-file";

export class NodeController {
    last_id: Accessor<number>;
    _increment_last_id: () => number;

    private _nodes: () => BaseNode[];
    private _setNodes: (val: BaseNode[]) => void;

    private node_constructors: Map<string, BaseNodeConstructor>;
    selected_constructor: string = "default";

    get nodes() { return this._nodes() }
    private set nodes(value: BaseNode[]) { this._setNodes(value); }

    constructor() {
        this.node_constructors = new Map();
        this.node_constructors.set("default", new BaseNodeConstructor("default"))

        const [last_id, setLastId] = createSignal(0)
        const increment_last_id = () => setLastId((previous) => previous + 1);
        this.last_id = last_id
        this._increment_last_id = increment_last_id
        
        const [nodes, setNodes] = createSignal<BaseNode[]>([])
        this._nodes = nodes;
        this._setNodes = setNodes;
    }

    public add_node(name: string, pos: Vector2) {
        // const new_node = new BaseNode(name, pos, this._increment_last_id())
        // this._setNodes([...this._nodes(), new_node]);
        const construct = this.node_constructors.get(this.selected_constructor);
        if (!construct) {
            console.error("Couldn't find constructor for", this.selected_constructor, "type");
            return;
        }
        const new_node = construct.make_node(name, pos, this._increment_last_id());
        this.nodes = [...this.nodes, new_node];
    }

    public load_node_types(node_file: NodeTypeFile) {
        this.node_constructors = node_file.node_constructors;
        this.selected_constructor = node_file.node_constructors.keys().toArray()[0];

        this.nodes = [];
    }
}