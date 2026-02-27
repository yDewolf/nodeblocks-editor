import { createSignal } from "solid-js";
import { NodeConnection } from "~/components/nodes/node-connection";
import { NodeSlot } from "~/components/nodes/node-slot";

export class ConnectionController {
    connections: NodeConnection[] = [];

    _selected_slot: () => NodeSlot | null;
    _set_selected_slot: (slot: NodeSlot | null) => void;

    constructor() {
        const [selectedSlot, setSelectedSlot] = createSignal(null);
        this._selected_slot = selectedSlot;
        this._set_selected_slot = setSelectedSlot;
    }

    get selected_slot() { return this._selected_slot() }
    set selected_slot(slot: NodeSlot | null) { this._set_selected_slot(slot) }

    public select_slot(slot: NodeSlot) {
        // FIXME: Testing purposes only:
        if (this.selected_slot != null) {
            const conn = this.are_connected(this.selected_slot, slot)
            if (conn != null) {
                this.connections = this.connections.filter((connection) => connection != conn);
                this.disconnect_nodes(conn);
                this.unselect_slot();
                return;
            }

            const succesfull = this.connect_node_to(this.selected_slot, slot);
            if (succesfull) {
                this.unselect_slot();
                return;
            }
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

        // FIXME: Improve this with a function to check if it exists in connections
        slot_a.connected = true;
        slot_b.connected = true;

        const connection = new NodeConnection(slot_a, slot_b);
        this.connections = [...this.connections, connection];
        return true;
    }

    public disconnect_nodes(connection: NodeConnection) {
        connection.slot_a.connected = false;
        connection.slot_b.connected = false;
    }

    public are_connected(slot_a: NodeSlot, slot_b: NodeSlot): NodeConnection | null {
        // FIXME: improve this
        this.connections.forEach(conn => {
            if ((conn.slot_a == slot_a && conn.slot_b == slot_b) || (conn.slot_b == slot_a && conn.slot_a == slot_b)) {
                return conn;
            }
        });

        return null;
    }
}