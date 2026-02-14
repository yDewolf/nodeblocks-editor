import { Accessor, createSignal } from "solid-js";
import { Vector2 } from '~/data_types/geometry';
import { BaseNode } from './base-node';

export class NodeController {
    last_id: Accessor<number>;
    _increment_last_id: () => number;
    private _nodes: BaseNode[] = [];
    private _setNodes: any;

    public nodes: () => BaseNode[];
    private setNodes: (val: BaseNode[]) => void;

    constructor() {
        const [last_id, setLastId] = createSignal(0)
        const increment_last_id = () => setLastId((previous) => previous + 1);
        this.last_id = last_id
        this._increment_last_id = increment_last_id
        
        const [nodes, setNodes] = createSignal<BaseNode[]>([])
        this.nodes = nodes;
        this.setNodes = setNodes;
    }

    public add_node(name: string, pos: Vector2) {
        const new_node = new BaseNode(name, pos, this._increment_last_id())
        this.setNodes([...this.nodes(), new_node]);
        return new_node;
    }
}