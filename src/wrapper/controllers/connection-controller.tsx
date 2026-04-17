import { nanoid } from "nanoid";
import { createSignal } from "solid-js";
import { Action } from "~/network/controllers/action-controller";
import { ConnectionActionPayload } from "~/network/websocket/request-types";
import { NodeConnection } from "~/wrapper/nodes/node-connection";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

export class ConnectionController {
    _connections: () => NodeConnection[];
    _set_connections: (conn: NodeConnection[]) => void;

    _disconnect_queue: Map<Action<any>, NodeConnection[]> = new Map();

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

    public clear() {
        this._set_connections([]);
        this._set_hovered_slot(null);
        this._set_selected_slot(null);
    }

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

    public connect_node_to(slot_a: NodeSlot, slot_b: NodeSlot, conn_uid: string = `conn_${nanoid(6)}`): boolean {
        if (!slot_a.can_connect_to(slot_b)) {
            return false;
        }

        const connection = new NodeConnection(slot_a, slot_b, conn_uid);
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

    public sync_disconnect(action: Action<any>) {
        const connections = this._disconnect_queue.get(action);
        if (connections) {
            connections.forEach((conn) => {
                this.disconnect_nodes(conn);
            });
        }
    }

    public queue_disconnect(connections: NodeConnection[], ref_action: Action<any>) {
        
        this._disconnect_queue.set(ref_action, connections);
    }

    public are_connected(slot_a: NodeSlot, slot_b: NodeSlot): NodeConnection | undefined {
        return slot_a.connections.get(slot_b);    
    }

    public get_conn(uid: string) {
        const filtered = this.connections.filter((conn) => conn.uid == uid);
        if (!filtered) {
            return null;
        }

        return filtered[0];
    }
}