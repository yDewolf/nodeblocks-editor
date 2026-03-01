import { createSignal } from "solid-js";
import { BaseNode } from "./base-node";
import { NodeConnection } from "./node-connection";
import { Vector2 } from "~/data_types/geometry";


export enum SlotTypes {
    INPUT,
    OUTPUT
}

export class NodeSlotStyle {
    default_anchor: Vector2;
    _anchor: () => Vector2;
    _set_anchor: (v: Vector2) => void;

    _version: () => number;
    _set_version: (v: number) => void;  

    constructor(slot_type: SlotTypes) {
        this.default_anchor = {x: slot_type == SlotTypes.INPUT ? -1 : 1, y: 0}

        // Gambiarra
        const [version, setVersion] = createSignal(0);
        this._version = version;
        this._set_version = setVersion;

        const [anchor, setAnchor] = createSignal(this.default_anchor);
        this._anchor = anchor;
        this._set_anchor = setAnchor;
    }
    
    get version() { return this._version(); }

    get anchor() { return this._anchor(); }
    set anchor(v: Vector2) { this._set_anchor(v); }

    public update_anchor(new_anchor: Vector2) {
        if (this.anchor.x === new_anchor.x && this.anchor.y === new_anchor.y) {
            return;
        };

        this.anchor = new_anchor;
        requestAnimationFrame(() => {
            this._set_version(this.version + 1);
        });
    }
}

export class NodeSlot {
    private _element: HTMLDivElement | undefined;
    parent_node: BaseNode;
    style: NodeSlotStyle;

    type: SlotTypes
    _selected: () => boolean;
    _set_selected: (v: boolean) => void;

    _connections: () => Map<NodeSlot, NodeConnection>;
    _set_connections: (v: Map<NodeSlot, NodeConnection>) => void;

    constructor(parent: BaseNode, slot_type: SlotTypes) {
        this.style = new NodeSlotStyle(slot_type);

        const [selected, setSelected] = createSignal(false);
        this._selected = selected;
        this._set_selected = setSelected

        const [connections, setConnections] = createSignal(new Map<NodeSlot, NodeConnection>);
        this._connections = connections;
        this._set_connections = setConnections;

        this.parent_node = parent;
        this.type = slot_type
    }

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

    public get_world_position(): Vector2 {
        // Keep signal updates
        this.style.anchor;
        this.style.version;

        if (!this._element) {
            return {
                x: this.parent_node.x + (this.type === SlotTypes.OUTPUT ? this.parent_node.width : 0),
                y: this.parent_node.y + (this.parent_node.height / 2)
            };
        }

        return {
            x: this.parent_node.x + this._element.offsetLeft + this._element.offsetWidth / 2,
            y: this.parent_node.y + this._element.offsetTop + this._element.offsetHeight / 2
        };
    }

    public update_best_anchor() {
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
                        "input-slot": this.type == SlotTypes.INPUT,
                        "output-slot": this.type == SlotTypes.OUTPUT,
                    }}
                >
                    {/* <div class="slot-label">bleh</div> */}
                </div>
            </div>
        )
    }
}