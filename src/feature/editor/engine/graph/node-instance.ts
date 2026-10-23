import { NodeSceneData, SlotPathData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { NodeSlotSpec, NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

export interface SlotInstanceData {
    connection_count: number
}
export type SlotDataListener = (data: SlotInstanceData) => void;
export class SlotInstance implements SlotPathData {
    private _listeners: Set<SlotDataListener> = new Set();
    
    node_id: string
    slot_id: string
    spec: NodeSlotSpec

    private _connection_count: number

    constructor(node_id: string, slot_id: string, spec: NodeSlotSpec) {
        this.node_id = node_id;
        this.slot_id = slot_id;
        this.spec = spec;

        this._connection_count = 0;
    }

    public subscribe(listener: SlotDataListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    get is_input() { return this.spec.is_input; }
    get can_connect() { 
        return this.spec.max_connections == 0 
            || this._connection_count < this.spec.max_connections
    }
    get data_type_fqn() {
        return this.spec.datatype_fqn;
    }

    get connection_count() { return this._connection_count }
    set connection_count(count: number) {
        this._connection_count = Math.max(0, count);
        this._listeners.forEach((listener) => listener({
            connection_count: this._connection_count
        }));
    }
}

export type NodeDataListener = (data: NodeSceneData) => void;
export class NodeInstance {
    private _listeners: Set<NodeDataListener> = new Set();

    scene_data: NodeSceneData
    slots: Record<string, SlotInstance>
    _input_slots: Array<SlotInstance>
    _output_slots: Array<SlotInstance>
    
    constructor(
        scene_data: NodeSceneData, 
        slots: Record<string, SlotInstance>, 
        private readonly _spec: NodeTypeSpec,
    ) {
        this.slots = slots;
        this.scene_data = scene_data;
        this._input_slots = Object.values(slots).filter((slot) => slot.is_input);
        this._output_slots = Object.values(slots).filter((slot) => !slot.is_input);
    }

    get spec() { return this._spec; }

    // Events

    public subscribe(listener: NodeDataListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }


    public updateSceneData(
        new_params?: Record<string, any>, 
        position?: Vector2,
    ): void {
        if (position) { this.scene_data.position = position; }
        if (new_params) {
            for (const [key, value] of Object.entries(new_params)) {
                this.scene_data.data[key] = value;
            }
        }
        this._listeners.forEach((listener) => listener(this.scene_data));
    }

    // Getters and utils
    get input_slots() { return this._input_slots; }
    get output_slots() { return this._output_slots; }

    get uid() { 
        if (!this.scene_data.uid) throw Error("Node is missing an uid.");
        return this.scene_data.uid; 
    }
    get fqn() { return this.scene_data.nodetype_fqn; }

    public add_slot(slot_id: string, spec: NodeSlotSpec): SlotInstance {
        const slot = new SlotInstance(this.uid, slot_id, spec);
        if (slot.is_input) {
            this._input_slots.push(slot);
        } else {
            this._output_slots.push(slot);
        }
        
        this.slots[slot_id] = slot;
        return slot;
    }

    public get_slot(slot_id: string): SlotInstance | undefined {
        if (!(slot_id in this.slots)) {
            return undefined;
        }
        return this.slots[slot_id];
    }
}
