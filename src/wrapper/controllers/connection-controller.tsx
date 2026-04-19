import { nanoid } from "nanoid";
import { createSignal } from "solid-js";
import { Action } from "~/network/controllers/actions/action-controller";
import { ConnectionActionPayload, ConnSceneRequestData } from "~/network/websocket/request-types";
import { NodeConnection } from "~/wrapper/nodes/node-connection";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { ConnectionSceneData, NodeSceneFile } from "../helpers/node-scene-file";
import { NodeController } from "./node-controller";

export class ConnectionController {
    _connections: () => NodeConnection[];
    _set_connections: (conn: NodeConnection[]) => void;

    _disconnect_queue: Map<Action<any>, NodeConnection[]> = new Map();


    constructor() {
        const [connections, setConnections] = createSignal([]);
        this._connections = connections;
        this._set_connections = setConnections;

    }

    get connections() { return this._connections(); }
    set connections(conn: NodeConnection[]) { this._set_connections(conn); }

    public clear() {
        this._set_connections([]);
    }

    public connect_node_to(slot_a: NodeSlot, slot_b: NodeSlot, conn_uid: string = ConnectionController.make_conn_uid()): NodeConnection | undefined {
        if (!slot_a.can_connect_to(slot_b)) {
            return undefined;
        }

        const connection = new NodeConnection(slot_a, slot_b, conn_uid);
        if (connection.causes_recursion()) {
            return undefined;
        }

        this.connections = [...this.connections, connection];
        connection.connect();
        return connection;
    }

    public disconnect_nodes(connection: NodeConnection) {
        this.connections = this.connections.filter((conn) => conn != connection);
        connection.disconnect();
        connection.free();
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

    public unsynced_connect(conns_data: ConnSceneRequestData, node_controller: NodeController) {
        let connections: Array<NodeConnection> = new Array();
        Object.entries(conns_data).forEach(([uid, conn_data]) => {
            const slots = ConnectionController.get_slots_from_path_data(conn_data, node_controller)
            if (slots) {
                const [slot_a, slot_b] = slots;
                const conn = this.connect_node_to(slot_a, slot_b, uid);             
                if (conn) {
                    connections.push(conn);
                }
            }
        });

        return connections
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

    public static get_slots_from_path_data(conn_data: ConnectionSceneData, node_controller: NodeController) {
        const node_a_path = NodeSceneFile.parse_node_path(conn_data.from_slot);
        const node_b_path = NodeSceneFile.parse_node_path(conn_data.to_slot);
        if (node_a_path.slot_name == undefined || node_b_path.slot_name == undefined) {
            console.error("Couldn't find node slots. Paths:", node_a_path, node_b_path);
            return;
        }

        const node_a = node_controller.get_node(node_a_path.node_id);
        const node_b = node_controller.get_node(node_b_path.node_id);
        if (!node_a || !node_b) {
            console.error("Couldn't find node slots. Paths:", node_a_path, node_b_path);
            return;
        }

        const slot_a = node_a.get_slot(node_a_path.slot_name);
        const slot_b = node_b.get_slot(node_b_path.slot_name);
        if (slot_a == undefined || slot_b == undefined) {
            console.error("Couldn't find node slots. Paths:", node_a_path, node_b_path);
            return;
        }

        return [slot_a, slot_b];
    }

    public static make_conn_uid() {
        return `conn_${nanoid(6)}`;
    }
}