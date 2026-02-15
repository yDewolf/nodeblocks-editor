import { Accessor, createSignal } from "solid-js";
import { Vector2 } from '~/data_types/geometry';
import { BaseNode } from './base-node';

export class NodeController {
    last_id: Accessor<number>;
    _increment_last_id: () => number;

    private _nodes: () => BaseNode[];
    private _setNodes: (val: BaseNode[]) => void;

    get nodes() { return this._nodes() }

    constructor() {
        const [last_id, setLastId] = createSignal(0)
        const increment_last_id = () => setLastId((previous) => previous + 1);
        this.last_id = last_id
        this._increment_last_id = increment_last_id
        
        const [nodes, setNodes] = createSignal<BaseNode[]>([])
        this._nodes = nodes;
        this._setNodes = setNodes;
    }

    public add_node(name: string, pos: Vector2) {
        const new_node = new BaseNode(name, pos, this._increment_last_id())
        this._setNodes([...this._nodes(), new_node]);
        return new_node;
    }
}