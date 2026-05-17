import { createMemo, createSignal, onMount, Show } from "solid-js";
import { GraphNode } from "../graph-node";
import { NodeConnection } from "../node-connection";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { NodeSlotStyle } from "./slot-style";
import { BaseNodeType, BaseSlotType, SuperSlotTypes } from "../data/node-data-type";
import { SlotOutput } from '../../../editor/ui/node/slot-output';
import { ReactiveMap } from "@solid-primitives/map";

export class NodeSlot {
    private _element: HTMLDivElement | undefined; // FIXME: SlotComponent
    parent_node: GraphNode;
    style: NodeSlotStyle; // FIXME: SlotComponent

    slot_name: string;

    max_connections: number = 0;
    data_type: BaseNodeType;
    type: BaseSlotType;
    _selected: () => boolean;
    _set_selected: (v: boolean) => void;

    _connections: ReactiveMap<NodeSlot, NodeConnection>;

    private _last_output: () => Map<string, any>;
    private _set_last_output: (out: Map<string, any>) => void;

    _last_world_pos: Vector2 = {x: 0, y: 0};

    constructor(parent: GraphNode, slot_type: BaseSlotType, slot_name: string, data_type: BaseNodeType | null = null, max_connections: number = 0) {
        this.style = new NodeSlotStyle(slot_type);

        this.max_connections = max_connections;
        this.data_type = data_type == null ? slot_type.data_type : data_type;
        this.slot_name = slot_name;

        const [lastOutput, setLastOutput] = createSignal(new Map());
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
    set last_output(output: Map<string, any>) { this._set_last_output(output); }

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
        
        if (!this.data_type.is_compatible_with(slot.data_type)) {
            return false;
        }

        if (!this.type.is_compatible_with(slot.type)) {
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
                x: this.parent_node.x + (this.type.super_type === SuperSlotTypes.OUTPUT ? this.parent_node.width : 0),
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

    public View(onClickOnSlot: (slot: NodeSlot) => void, onHoverSlot: (slot: NodeSlot) => void) {
        return (
            <div 
                ref={this._element}
                class="slot-container container"
                
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onClickOnSlot(this);
                }}

                onMouseOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onHoverSlot(this);
                }}
            >
                <div 
                    class="slot-dot"
                    classList={{
                        "connected-slot": this.connections.size > 0,
                        "selected-slot": this.selected,
                        "input-slot": this.type.super_type == SuperSlotTypes.INPUT,
                        "output-slot": this.type.super_type == SuperSlotTypes.OUTPUT,
                    }}
                >
                    <div class="slot-dot-content">
                        {this.slot_name}
                        {/* <SlotOutput slot={this}/> */}
                    </div>
                </div>
            </div>
        )
    }
}