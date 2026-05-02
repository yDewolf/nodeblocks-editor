import { NodeServerClient } from "../websocket/websocket-handler";
import { ServerMessages } from "../websocket/websocket-protocol";
import { NotificationTarget, ServerNotification } from "../websocket/requests/notifications";
import { createStore, produce, SetStoreFunction } from "solid-js/store";

type NotificationStore = {
    nodes: Record<string, ServerNotification[]>;
    slots: Record<string, ServerNotification[]>;
    parameters: Record<string, ServerNotification[]>;
    connections: Record<string, ServerNotification[]>;
    global: ServerNotification[];
}

export class NotificationController {
    private _client: NodeServerClient;
    private _notifications: NotificationStore;
    private _set_notifications: SetStoreFunction<NotificationStore>;

    constructor(client: NodeServerClient) {
        const [notifications, setNotifications] = createStore<NotificationStore>({
            nodes: {} as Record<string, ServerNotification[]>,
            slots: {} as Record<string, ServerNotification[]>, // node_uid:slot_name
            parameters: {} as Record<string, ServerNotification[]>, // node_uid:param_name
            connections: {} as Record<string, ServerNotification[]>,
            global: [] as ServerNotification[]
        });
        this._notifications = notifications;
        this._set_notifications = setNotifications;

        this._client = client;
        this._client.add_handler(ServerMessages.NOTIFICATION, this.handle_notification);
    }

    private handle_notification = (msg: ServerNotification) => {
        this._set_notifications(produce((state) => {
            switch (msg.target) {
                case NotificationTarget.NODE:
                    if (!state.nodes[msg.node_uid!]) state.nodes[msg.node_uid!] = [];
                    state.nodes[msg.node_uid!].push(msg);
                    break;
                
                case NotificationTarget.SLOT:
                    const slot_key = `${msg.node_uid}:${msg.slot_name}`;
                    if (!state.slots[slot_key]) state.slots[slot_key] = [];
                    state.slots[slot_key].push(msg);
                    break;

                case NotificationTarget.PARAMETER:
                    const param_key = `${msg.node_uid}:${msg.param_name}`;
                    if (!state.parameters[param_key]) state.parameters[param_key] = [];
                    state.parameters[param_key].push(msg);
                    break;

                case NotificationTarget.CONNECTION:
                    if (!state.connections[msg.conn_uid!]) state.connections[msg.conn_uid!] = [];
                    state.connections[msg.conn_uid!].push(msg);
                    break;

                default:
                    state.global.push(msg);
            }
        }));
    }

    public forNode(node_uid: string) {
        return this._notifications.nodes[node_uid] || [];
    }

    public forSlot(node_uid: string, slot_name: string) {
        return this._notifications.slots[`${node_uid}:${slot_name}`] || [];
    }

    public forParam(node_uid: string, param_name: string) {
        return this._notifications.parameters[`${node_uid}:${param_name}`] || [];
    }
    
    public forConn(conn_uid: string) {
        return this._notifications.connections[conn_uid] || [];
    }

    public forGlobal() {
        return this._notifications.global || [];
    }

    public clear_notifications() {
        this._set_notifications({ nodes: {}, slots: {}, connections: {}, global: [] });
    }
}