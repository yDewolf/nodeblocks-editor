import { createSignal } from "solid-js";
import { BaseNode } from "./base-node";
import { NodeConnection } from "./node-connection";
import { EditorCamera } from "../editor/editor-space";
import { Vector2 } from "~/data_types/geometry";


export enum SlotTypes {
    INPUT,
    OUTPUT
}

export class NodeSlot {
    parent_node: BaseNode;

    type: SlotTypes
    _selected: () => boolean;
    _set_selected: (v: boolean) => void;

    _connections: () => Map<NodeSlot, NodeConnection>;
    _set_connections: (v: Map<NodeSlot, NodeConnection>) => void;
    // connections: Map<NodeSlot, NodeConnection>[] = [];

    constructor(parent: BaseNode, slot_type: SlotTypes) {
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
        const world_pos = {
            x: this.parent_node.x + (this.type === SlotTypes.OUTPUT ? this.parent_node.width : 0),
            y: this.parent_node.y + (this.parent_node.height / 2)
        };
        return world_pos 
    }

    public View(onClickOnSlot: (slot: NodeSlot) => void) {
        return (
            <div 
                class="slot-container"
                
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onClickOnSlot(this);
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