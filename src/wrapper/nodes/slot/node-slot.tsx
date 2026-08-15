import { createMemo, createSignal, onMount, Show } from "solid-js";
import { GraphNode } from "../graph-node";
import { NodeConnection } from "../node-connection";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { NodeSlotStyle } from "./slot-style";
import { ReactiveMap } from "@solid-primitives/map";
import { BaseDataType } from "../data/node-data-type";
import { BaseSlotType } from "../data/slot-types";

export interface SlotOutputWrapper {
    value: any,
    value_meta?: any
}

export class NodeSlot {
    parent_node: GraphNode;
    _element: HTMLDivElement | undefined; // FIXME: SlotComponent
    style: NodeSlotStyle; // FIXME: SlotComponent

    slot_id: string;

    max_connections: number = 0;
    data_type: BaseDataType;
    type: BaseSlotType;
    is_input: boolean;

    _selected: () => boolean;
    _set_selected: (v: boolean) => void;

    _connections: ReactiveMap<NodeSlot, NodeConnection>;

    private _last_output: () => SlotOutputWrapper;
    private _set_last_output: (out: SlotOutputWrapper) => void;

    _last_world_pos: Vector2 = {x: 0, y: 0};

    constructor(parent: GraphNode, slot_type: BaseSlotType, slot_id: string, is_input: boolean, data_type: BaseDataType | null = null, max_connections: number = 0) {
        this.style = new NodeSlotStyle(slot_type, is_input);

        this.max_connections = max_connections;
        this.is_input = is_input;
        this.data_type = data_type == null ? slot_type.data_type : data_type;
        this.slot_id = slot_id;

        const [lastOutput, setLastOutput] = createSignal({value: undefined, value_meta: undefined});
        this._last_output = lastOutput;
        this._set_last_output = setLastOutput;

        const [selected, setSelected] = createSignal(false);
        this._selected = selected;
        this._set_selected = setSelected

        const connections = new ReactiveMap<NodeSlot, NodeConnection>();
        this._connections = connections;

        this.parent_node = parent;
        this.type = slot_type
    }

    get last_output() { return this._last_output() }
    set last_output(output: SlotOutputWrapper) { this._set_last_output(output); }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._set_selected(value); }

    get connections() { return this._connections }

    get raw_connections() {
        return this._connections.values().toArray();
    }

    public add_connection(connection: NodeConnection) {
        this.connections.set(connection.get_other_node(this), connection);
    }

    public remove_connection(connection: NodeConnection) {
        this.connections.delete(connection.get_other_node(this));
    }

    public can_connect_to(slot: NodeSlot) {
        if (slot == this) {
            return false;
        }

        if (this.is_input == slot.is_input) {
            return false;
        }
        
        if (!this.data_type.is_compatible_with(slot.data_type)) {
            return false;
        }

        if (this.connections.size >= this.max_connections && this.max_connections != 0) {
            return false;
        }

        return true;
    }

    // FIXME: Create a SlotComponent, that does everything below
    public get_world_position(): Vector2 {
        // Keep signal updates
        this.parent_node.width;
        this.parent_node.height;

        this.style.anchor;
        this.style.version;

        if (!this._element) {
            const world_pos = {
                x: this.parent_node.x + (this.is_input == false ? this.parent_node.width : 0),
                y: this.parent_node.y + (this.parent_node.height / 2)
            };
            this._last_world_pos = world_pos;
            return world_pos;
        }

        const world_pos = {
            x: this.parent_node.x + this._element.offsetLeft + this._element.offsetWidth / 2,
            y: this.parent_node.y + this._element.offsetTop + this._element.offsetHeight / 2
        }; 
        this._last_world_pos = world_pos;
        return world_pos; 
    }
    
    public update_anchor() {
        this._update_best_anchor();
        if (this.raw_connections.length == 0) {
            this.style.anchor = this.style.default_anchor;
            return;
        }

        this.raw_connections.forEach(conn => {
            conn.get_other_node(this)._update_best_anchor();
        });
    }

    private _update_best_anchor() {
        const connections = this.raw_connections;
        if (connections.length === 0) return;

        let average_pos = {x: 0, y: 0};
        connections.forEach(conn => {
            const other_node = conn.get_other_node(this).parent_node;
            average_pos.x += (other_node.x + other_node.width / 2) - (this.parent_node.x + this.parent_node.width / 2);
            average_pos.y += (other_node.y + other_node.height / 2) - (this.parent_node.y + this.parent_node.height / 2);
        });

        if (Math.abs(average_pos.x) > Math.abs(average_pos.y)) {
            this.style.update_anchor({ x: average_pos.x > 0 ? 1 : -1, y: 0 });
            return;
        }

        this.style.update_anchor({ x: 0, y: average_pos.y > 0 ? 1 : -1 });
    }
}