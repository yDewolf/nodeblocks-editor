import { createSignal } from "solid-js";
import { NodeConnection } from "~/components/nodes/node-connection";
import { NodeSlot } from "~/components/nodes/node-slot";

export class ConnectionController {
    _connections: () => NodeConnection[];
    _set_connections: (conn: NodeConnection[]) => void;

    _selected_slot: () => NodeSlot | null;
    _set_selected_slot: (slot: NodeSlot | null) => void;

    constructor() {
        const [connections, setConnections] = createSignal([]);
        this._connections = connections;
        this._set_connections = setConnections;

        const [selectedSlot, setSelectedSlot] = createSignal(null);
        this._selected_slot = selectedSlot;

        this._set_selected_slot = setSelectedSlot;
    }

    get connections() { return this._connections(); }
    set connections(conn: NodeConnection[]) { this._set_connections(conn); }

    get selected_slot() { return this._selected_slot() }
    set selected_slot(slot: NodeSlot | null) { this._set_selected_slot(slot) }

    public select_slot(slot: NodeSlot) {
        // FIXME: Testing purposes only:
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
        this.connections = [...this.connections, connection];
        console.log("connecting:")
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
}