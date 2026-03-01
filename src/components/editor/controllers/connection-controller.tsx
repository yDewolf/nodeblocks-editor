import { createSignal } from "solid-js";
import { NodeConnection } from "~/components/nodes/node-connection";
import { NodeSlot } from "~/components/nodes/node-slot";

export class ConnectionController {
    _connections: () => NodeConnection[];
    _set_connections: (conn: NodeConnection[]) => void;

    _selected_slot: () => NodeSlot | null;
    _set_selected_slot: (slot: NodeSlot | null) => void;

    _hovered_slot: () => NodeSlot | null;
    _set_hovered_slot: (slot: NodeSlot | null) => void;

    constructor() {
        const [connections, setConnections] = createSignal([]);
        this._connections = connections;
        this._set_connections = setConnections;

        const [selectedSlot, setSelectedSlot] = createSignal(null);
        this._selected_slot = selectedSlot;
        this._set_selected_slot = setSelectedSlot;

        const [hoveredSlot, sethoveredSlot] = createSignal(null);
        this._hovered_slot = hoveredSlot;
        this._set_hovered_slot = sethoveredSlot;
    }

    get connections() { return this._connections(); }
    set connections(conn: NodeConnection[]) { this._set_connections(conn); }

    get selected_slot() { return this._selected_slot() }
    set selected_slot(slot: NodeSlot | null) { this._set_selected_slot(slot) }

    get hovered_slot() { return this._hovered_slot() }
    set hovered_slot(slot: NodeSlot | null) { this._set_hovered_slot(slot) }

    public select_slot(slot: NodeSlot) {
        if (this.selected_slot != null) {
            const conn = this.are_connected(this.selected_slot, slot)
            if (conn != undefined) {
                this.disconnect_nodes(conn);
                this.unselect_slot();
                return;
            }

            const succesfull = this.connect_node_to(this.selected_slot, slot);
            // TODO: Desselect slot only if shift is not pressed
            this.unselect_slot();
            return;
        }

        this.unselect_slot();

        this.selected_slot = slot;
        this.selected_slot.selected = true;
    }

    public unselect_slot() {
        if (this.selected_slot != null) {
            this.selected_slot.selected = false;
        } 
        this.selected_slot = null;
    }

    public connect_node_to(slot_a: NodeSlot, slot_b: NodeSlot): boolean {
        if (slot_a.type == slot_b.type) {
            return false;
        }

        const connection = new NodeConnection(slot_a, slot_b);
        if (connection.causes_recursion()) {
            return false;
        }

        this.connections = [...this.connections, connection];
        connection.connect();
        return true;
    }

    public disconnect_nodes(connection: NodeConnection) {
        this.connections = this.connections.filter((conn) => conn != connection);
        connection.disconnect()
    }

    public are_connected(slot_a: NodeSlot, slot_b: NodeSlot): NodeConnection | undefined {
        return slot_a.connections.get(slot_b);    
    }


    public updateConnectionAnchors(conn: NodeConnection) {
        const node_a = conn.slot_a.parent_node;
        const node_b = conn.slot_b.parent_node;

        const dx = (node_b.x + node_b.width / 2) - (node_a.x + node_a.width / 2);
        const dy = (node_b.y + node_b.height / 2) - (node_a.y + node_a.height / 2);

        if (Math.abs(dx) > Math.abs(dy)) {
            conn.slot_a.style.update_anchor(dx > 0 ? {x: 1, y: 0} : {x: -1, y: 0});
            conn.slot_b.style.update_anchor(dx > 0 ? {x: -1, y: 0} : {x: 1, y: 0});
            return;
        }

        conn.slot_a.style.update_anchor(dy > 0 ? {x: 0, y: 1} : {x: 0, y: -1});
        conn.slot_b.style.update_anchor(dy > 0 ? {x: 0, y: -1} : {x: 0, y: 1});
    }
}