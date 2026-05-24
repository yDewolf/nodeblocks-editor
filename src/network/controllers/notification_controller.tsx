import { NodeServerClient } from "../websocket/websocket-handler";
import { ClientMessages, ServerMessages } from "../websocket/websocket-protocol";
import { isConnNotify, isNodeNotify, isParamNotify, isSlotNotify, NotificationLevel, NotificationTarget, NotificationWithMeta, ServerNotification } from '../websocket/requests/notifications';
import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { NodeEditor } from "~/editor/node-editor";
import { Vector2 } from "~/wrapper/data_types/geometry";


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

    _editor: NodeEditor | undefined = undefined;
    ignored_level: NotificationLevel[] = [NotificationLevel.DEBUG];

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
        this._client.add_handler(ServerMessages.HANDSHAKE_SYNC, (message) => {
            this._client.sendCommand({type: ClientMessages.SYNC_NOTIFICATIONS});
        })

        this._client.add_handler(ServerMessages.NOTIFICATION, this._handle_notification);
        this._client.add_handler(ServerMessages.SYNC_NOTIFICATIONS, (message) => {
            message.notifications.forEach((notification) => {
                this._handle_notification(notification);
            });
        });

        this._setup_virtual_notifications();
    }

    private _setup_virtual_notifications() {
        this._client.add_handler(ServerMessages.HANDSHAKE_SYNC, () => {
            this.send_virtual_notification({
                type: ServerMessages.NOTIFICATION, 
                level: NotificationLevel.INFO,
                target: NotificationTarget.UNSPECIFIED,
                message: "Connected to Server",
                uid: "connected"
            })
        });
        
        this._client.add_handler(ServerMessages.CLOSE_SOCKET, () => {
            this.send_virtual_notification({
                type: ServerMessages.NOTIFICATION, 
                level: NotificationLevel.WARNING,
                target: NotificationTarget.UNSPECIFIED,
                message: "Socket Closed",
                uid: "socket_closed"
            })
        });
    }

    public send_virtual_notification = (msg: ServerNotification) => {
        this._handle_notification(msg, true);
    }

    
    private _handle_notification = (msg: ServerNotification, is_virtual: boolean = false) => {
        if (this.ignored_level.includes(msg.level)) return;
        
        this._set_notifications(produce((state) => {
            let target_list: NotificationWithMeta[];
            switch (msg.target) {
                case NotificationTarget.NODE:
                    if (!state.nodes[msg.node_uid!]) state.nodes[msg.node_uid!] = [];
                    target_list = state.nodes[msg.node_uid!];
                    break;
                case NotificationTarget.SLOT:
                    const slot_key = `${msg.node_uid}:${msg.slot_name}`;
                    if (!state.slots[slot_key]) state.slots[slot_key] = [];
                    target_list = state.slots[slot_key];
                    break;
                case NotificationTarget.PARAMETER:
                    const param_key = `${msg.node_uid}:${msg.param_name}`;
                    if (!state.parameters[param_key]) state.parameters[param_key] = [];
                    target_list = state.parameters[param_key];
                    break;
                case NotificationTarget.CONNECTION:
                    if (!state.connections[msg.conn_uid!]) state.connections[msg.conn_uid!] = [];
                    target_list = state.connections[msg.conn_uid!];
                    break;
                default:
                    target_list = state.global;
            }

            const existing = target_list.find(notification => 
                notification.message == msg.message && 
                notification.level == msg.level &&
                notification.node_uid == msg.node_uid &&
                notification.param_name == msg.param_name &&
                notification.slot_name == msg.slot_name &&
                notification.conn_uid == msg.conn_uid &&
                !notification.read
            );
            
            if (existing) {
                existing.count = (existing.count || 1) + 1;
                existing.timestamp = Date.now();
                existing.read = false;
                return;
            }   
            target_list.push({
                ...msg,
                read: false,
                timestamp: Date.now(),
                count: 1,
                is_virtual: is_virtual
            });
        }));
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
        } else {
            this._set_notifications(
                target_mapping, this.get_notification_key(notification), (n) => n.uid === notification.uid, "read", true
            )
        }

        this._client.sendCommand({type: ClientMessages.UPDATE_NOTIFICATION,
            payload: notification
        });
    }

    public markAllAsRead() {
        this._set_notifications(produce((state) => {
            state.global.forEach(n => n.read = true);
            Object.values(state.nodes).forEach(list => list.forEach(n => n.read = true));
        }));
    }

    
    public get_notification_key(notification: ServerNotification): string {
        if (isNodeNotify(notification)) return notification.node_uid!;
        if (isSlotNotify(notification)) return `${notification.node_uid}:${notification.slot_name}`;
        if (isParamNotify(notification)) return `${notification.node_uid}:${notification.param_name}`;
        if (isConnNotify(notification)) return notification.conn_uid!;
        
        return notification.uid;
    }


    public handle_goto(notification: ServerNotification) {
        if (!this._editor) return;

        if (notification.node_uid != undefined) {
            const node = this._editor.scene_controller.node_controller.get_node(notification.node_uid);
            if (node) {
                if (notification.slot_name != undefined) {
                    const slot = node.get_slot(notification.slot_name);
                    if (slot) this._editor.editor_space.teleport_to_pos(slot._last_world_pos)
                }

                this._editor.editor_space.teleport_to_rect(node.rect)
                return;
            }
        }

        if (notification.conn_uid != undefined) {
            const conn = this._editor.scene_controller.connection_controller.get_conn(notification.conn_uid);
            if (conn) {
                const pos_a = conn.slot_a._last_world_pos;
                const pos_b = conn.slot_b._last_world_pos;
                const medium: Vector2 = {
                    x: (pos_a.x + pos_b.x) / 2,
                    y: (pos_a.y + pos_b.y) / 2,
                }

                this._editor.editor_space.teleport_to_pos(medium);
            }
        }
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

    public forAll() {
        return [
            ...this.forGlobal(),
            ...Object.values(this._notifications.nodes).flat(),
            ...Object.values(this._notifications.slots).flat(),
            ...Object.values(this._notifications.parameters).flat(),
            ...Object.values(this._notifications.connections).flat(),
        ]
    }
}