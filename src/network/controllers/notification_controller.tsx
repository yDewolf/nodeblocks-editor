import { NodeServerClient } from "../websocket/websocket-handler";
import { ServerMessages } from "../websocket/websocket-protocol";
import { NotificationTarget, ServerNotification } from '../websocket/requests/notifications';
import { createStore, produce, SetStoreFunction } from "solid-js/store";

export type NotificationWithMeta = ServerNotification & {
    read: boolean,
    timestamp: number
}

type NotificationStore = {
    nodes: Record<string, NotificationWithMeta[]>;
    slots: Record<string, NotificationWithMeta[]>;
    parameters: Record<string, NotificationWithMeta[]>;
    connections: Record<string, NotificationWithMeta[]>;
    global: NotificationWithMeta[];
}

export class NotificationController {
    private _client: NodeServerClient;
    private _notifications: NotificationStore;
    private _set_notifications: SetStoreFunction<NotificationStore>;

    constructor(client: NodeServerClient) {
        const [notifications, setNotifications] = createStore<NotificationStore>({
            nodes: {} as Record<string, NotificationWithMeta[]>,
            slots: {} as Record<string, NotificationWithMeta[]>, // node_uid:slot_name
            parameters: {} as Record<string, NotificationWithMeta[]>, // node_uid:param_name
            connections: {} as Record<string, NotificationWithMeta[]>,
            global: [] as NotificationWithMeta[]
        });
        this._notifications = notifications;
        this._set_notifications = setNotifications;

        this._client = client;
        this._client.add_handler(ServerMessages.NOTIFICATION, this.handle_notification);
    }

    private handle_notification = (msg: ServerNotification) => {
        const msg_with_meta: NotificationWithMeta = {
            ...msg,
            read: false,
            timestamp: Date.now()
        };
        this._set_notifications(produce((state) => {
            switch (msg.target) {
                case NotificationTarget.NODE:
                    if (!state.nodes[msg.node_uid!]) state.nodes[msg.node_uid!] = [];
                    state.nodes[msg.node_uid!].push(msg_with_meta);
                    break;
                
                case NotificationTarget.SLOT:
                    const slot_key = `${msg.node_uid}:${msg.slot_name}`;
                    if (!state.slots[slot_key]) state.slots[slot_key] = [];
                    state.slots[slot_key].push(msg_with_meta);
                    break;

                case NotificationTarget.PARAMETER:
                    const param_key = `${msg.node_uid}:${msg.param_name}`;
                    if (!state.parameters[param_key]) state.parameters[param_key] = [];
                    state.parameters[param_key].push(msg_with_meta);
                    break;

                case NotificationTarget.CONNECTION:
                    if (!state.connections[msg.conn_uid!]) state.connections[msg.conn_uid!] = [];
                    state.connections[msg.conn_uid!].push(msg_with_meta);
                    break;

                default:
                    state.global.push(msg_with_meta);
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
        this._set_notifications({ nodes: {}, slots: {}, parameters: {}, connections: {}, global: [] });
    }

    public mark_as_read(notification: NotificationWithMeta) {
        const target_mapping = 
            notification.target == NotificationTarget.UNSPECIFIED ? "global" :
            notification.target == NotificationTarget.NODE ? "nodes" :
            notification.target == NotificationTarget.SLOT ? "slots" :
            notification.target == NotificationTarget.CONNECTION ? "connections" :
            notification.target == NotificationTarget.PARAMETER ? "parameters" : "global"
        ;
        if (target_mapping == "global") {
            this._set_notifications(
                target_mapping, 
                (item: any) => item.uid === notification.uid,
                produce((n) => {
                    n.read = true;
                })
            );
            return;
        }
        this._set_notifications(
            target_mapping, this.get_notification_key(notification), (n) => n.uid === notification.uid, "read", true
        )
    }

    public markAllAsRead() {
        this._set_notifications(produce((state) => {
            state.global.forEach(n => n.read = true);
            Object.values(state.nodes).forEach(list => list.forEach(n => n.read = true));
        }));
    }

    public get_notification_key(notification: ServerNotification): string {
        if (notification.target == NotificationTarget.NODE) return notification.node_uid;
        if (notification.target == NotificationTarget.SLOT) return `${notification.node_uid}:${notification.slot_name}`;
        if (notification.target == NotificationTarget.PARAMETER) return `${notification.node_uid}:${notification.param_name}`;
        if (notification.target == NotificationTarget.CONNECTION) return notification.conn_uid;
        
        return notification.uid;
    }
}