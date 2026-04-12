import { createSignal } from "solid-js";
import { NodeSlot } from "./slot/node-slot";
import { SuperSlotTypes } from "./data/node-data-type";


// Representa uma conexão entre dois nodes
// Apenas uma instância existe, ao invés de cada node apontar para o outro node
export class NodeConnection {
    uid: string
    slot_a: NodeSlot
    slot_b: NodeSlot

    _data: () => Map<string, unknown>;
    _set_data: (data: Map<string, unknown>) => void;

    constructor(slot_a: NodeSlot, slot_b: NodeSlot, uid: string = "") {
        this.uid = uid;
        this.slot_a = slot_a;
        this.slot_b = slot_b;

        const [data, setData] = createSignal(new Map<string, unknown>());
        this._data = data;
        this._set_data = setData;
    }

    get data() { return this._data(); }
    set data(data: Map<string, unknown>) { this._set_data(data); }

    public connect() {
        this.slot_a.add_connection(this);
        this.slot_b.add_connection(this);
        
        this._update_anchors();
    }

    public disconnect() {
        this.slot_a.remove_connection(this);
        this.slot_b.remove_connection(this);
        this._update_anchors();
    }

    private _update_anchors() {
        this.slot_a.parent_node.all_slots.forEach(slot => {
            slot.update_anchor();
        });

        this.slot_b.parent_node.all_slots.forEach(slot => {
            slot.update_anchor();
        });
    }

    public get_other_node(root_node: NodeSlot) { 
        const other_node = this.slot_a == root_node ? this.slot_b : this.slot_a

        return other_node;
    }

    get input_slot() {
        if (this.slot_a.type.super_type == SuperSlotTypes.INPUT) {
            return this.slot_a;
        }

        return this.slot_b
    }

    get output_slot() {
        if (this.slot_a.type.super_type == SuperSlotTypes.OUTPUT) {
            return this.slot_a;
        }

        return this.slot_b
    }

    // FIXME: https://github.com/yDewolf/NodeEditor/issues/2
    public causes_recursion(): boolean {
        const node_a = this.slot_a.parent_node;
        const node_b = this.slot_b.parent_node;

        // node_a.inputs.forEach(slot => {
        //     slot.connections.has(node_b.)
        // });
        return false;
    }
}