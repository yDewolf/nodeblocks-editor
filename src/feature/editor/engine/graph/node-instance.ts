import { NodeSceneData, SlotPathData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { NodeSlotSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

export class SlotInstance implements SlotPathData {
    node_id: string
    slot_id: string
    spec: NodeSlotSpec

    connection_count: number

    constructor(node_id: string, slot_id: string, spec: NodeSlotSpec) {
        this.node_id = node_id;
        this.slot_id = slot_id;
        this.spec = spec;

        this.connection_count = 0;
    }

    get is_input() { return this.spec.is_input; }
    get can_connect() { 
        return this.spec.max_connections == 0 
            || this.connection_count < this.spec.max_connections
    }
    get data_type_fqn() {
        return this.spec.data_type_id;
    }
}

export type NodeDataListener = (data: NodeSceneData) => void;
export class NodeInstance {
    private _listeners: Set<NodeDataListener> = new Set();

    scene_data: NodeSceneData
    slots: Record<string, SlotInstance>

    constructor(scene_data: NodeSceneData, slots: Record<string, SlotInstance>) {
        this.slots = slots
        this.scene_data = scene_data;
    }

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

    get uid() { 
        if (!this.scene_data.uid) throw Error("Node is missing an uid.");
        return this.scene_data.uid; 
    }
    get fqn() { return this.scene_data.nodetype_fqn; }

    public add_slot(slot_id: string, spec: NodeSlotSpec): SlotInstance {
        const slot = new SlotInstance(this.uid, slot_id, spec);
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
