import { createMemo, createSignal, Show } from "solid-js";
import { BaseNode } from "../base-node";
import { NodeConnection } from "../node-connection";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { NodeSlotStyle } from "./slot-style";
import { BaseNodeType, BaseSlotType, SuperSlotTypes } from "../data/node-data-type";

export class NodeSlot {
    private _element: HTMLDivElement | undefined;
    parent_node: BaseNode;
    style: NodeSlotStyle;

    slot_name: string;

    data_type: BaseNodeType;
    type: BaseSlotType;
    _selected: () => boolean;
    _set_selected: (v: boolean) => void;

    _connections: () => Map<NodeSlot, NodeConnection>;
    _set_connections: (v: Map<NodeSlot, NodeConnection>) => void;

    private _last_output: () => any;
    private _set_last_output: (out: any) => void;

    constructor(parent: BaseNode, slot_type: BaseSlotType, slot_name: string, data_type: BaseNodeType | null = null) {
        this.style = new NodeSlotStyle(slot_type);

        this.data_type = data_type == null ? slot_type.data_type : data_type;
        this.slot_name = slot_name;

        const [lastOutput, setLastOutput] = createSignal(null);
        this._last_output = lastOutput;
        this._set_last_output = setLastOutput;

        const [selected, setSelected] = createSignal(false);
        this._selected = selected;
        this._set_selected = setSelected

        const [connections, setConnections] = createSignal(new Map<NodeSlot, NodeConnection>);
        this._connections = connections;
        this._set_connections = setConnections;

        this.parent_node = parent;
        this.type = slot_type
    }

    get last_output() { return this._last_output() }
    set last_output(output: any) { this._set_last_output(output) }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._set_selected(value); }

    get connections() { return this._connections() }
    set connections(value: Map<NodeSlot, NodeConnection>) { this._set_connections(value); }
    
    get raw_connections() {
        return this._connections().values().toArray();
    }

    public add_connection(connection: NodeConnection) {
        // Workaround on SolidJS signals
        const newMap = new Map(this.connections);
        
        newMap.set(connection.get_other_node(this), connection);
        this.connections = newMap;
    }

    public remove_connection(connection: NodeConnection) {
        const newMap = new Map(this.connections);
        
        newMap.delete(connection.get_other_node(this));
        this.connections = newMap;
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

        // TODO: Check recursion

        return true;
    }

    public get_world_position(): Vector2 {
        // Keep signal updates
        this.style.anchor;
        this.style.version;

        if (!this._element) {
            return {
                x: this.parent_node.x + (this.type.super_type === SuperSlotTypes.OUTPUT ? this.parent_node.width : 0),
                y: this.parent_node.y + (this.parent_node.height / 2)
            };
        }

        return {
            x: this.parent_node.x + this._element.offsetLeft + this._element.offsetWidth / 2,
            y: this.parent_node.y + this._element.offsetTop + this._element.offsetHeight / 2
        };
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
        const slot_output = createMemo(() => {
            if (this.last_output) {
                console.log(this.last_output)
                return this.last_output;
            }
            return null;
        });

        return (
            <div 
                ref={this._element}
                class="slot-container"
                
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
                    <Show when={slot_output() != null}>
                        <div class="slot-label">{
                            typeof slot_output() === 'object' 
                            ? JSON.stringify(slot_output()) 
                            : String(slot_output())
                        }</div>
                    </Show>
                </div>
            </div>
        )
    }
}