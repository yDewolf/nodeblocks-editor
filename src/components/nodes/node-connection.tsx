import { createSignal } from "solid-js";
import { NodeSlot } from "./node-slot";


// Representa uma conexão entre dois nodes
// Apenas uma instância existe, ao invés de cada node apontar para o outro node
export class NodeConnection {
    slot_a: NodeSlot
    slot_b: NodeSlot

    _data: () => Map<string, unknown>;
    _set_data: (data: Map<string, unknown>) => void;

    constructor(slot_a: NodeSlot, slot_b: NodeSlot) {
        this.slot_a = slot_a;
        this.slot_b = slot_b;

        const [data, setData] = createSignal(new Map<string, unknown>());
        this._data = data;
        this._set_data = setData;
    }

    get data() { return this._data(); }
    set data(data: Map<string, unknown>) { this._set_data(data); }
}