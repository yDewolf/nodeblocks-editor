import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { NotificationWithMeta, NotificationLevel, NotificationTarget, isNodeNotify, isSlotNotify, isParamNotify, isConnNotify, NotificationLevelOrder, Notification } from "~/protocols/notification-protocol";
import { SceneConnectionManager } from "../../network/scene-connection-manager";
import { CanvasElementController } from "~/feature/scene/controllers/canvas-element-controller";
import { CanvasSpace } from "../../canvas/editor-space";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { ServerMessageTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { NotificationFactory } from "./notification-factory";

type NotificationStore = {
    nodes: Record<string, NotificationWithMeta[]>;
    slots: Record<string, NotificationWithMeta[]>;
    parameters: Record<string, NotificationWithMeta[]>;
    connections: Record<string, NotificationWithMeta[]>;
    global: NotificationWithMeta[];
}

export class NotificationController {
    private _notifications: NotificationStore;
    private _set_notifications: SetStoreFunction<NotificationStore>;

    ignored_level: NotificationLevel[] = [NotificationLevel.DEBUG];

    constructor(
        private readonly sceneConnection: SceneConnectionManager,
        private readonly elementController: CanvasElementController
    ) {
        [this._notifications, this._set_notifications] = createStore<NotificationStore>({
            nodes: {} as Record<string, NotificationWithMeta[]>,
            slots: {} as Record<string, NotificationWithMeta[]>, // node_uid:slot_id
            parameters: {} as Record<string, NotificationWithMeta[]>, // node_uid:param_name
            connections: {} as Record<string, NotificationWithMeta[]>,
            global: [] as NotificationWithMeta[]
        });
        this.setupEngineHandlers();
        this.setupCommandResponseHandlers()
    }
    
    private setupEngineHandlers() {
        this.sceneConnection.onMessage(ServerMessageTypes.GRAPH_EVENT, (msg) => {
            const notif = NotificationFactory.fromEngineEvent(msg.event_payload);
            if (!notif || this.ignored_level.includes(notif.level)) return;

            this._handle_notification(notif);
        })
    }

    private setupCommandResponseHandlers() {
        this.sceneConnection.onMessage(ServerMessageTypes.COMMAND_RESPONSE, (msg) => {
            const notif = NotificationFactory.fromCommandResponse(msg.response_payload);
            if (!notif || this.ignored_level.includes(notif.level)) return;

            this._handle_notification(notif);
        });
    }

    private _handle_notification = (msg: Notification) => {
        if (this.ignored_level.includes(msg.level)) return;
        
        this._set_notifications(produce((state) => {
            let target_list: NotificationWithMeta[];
            switch (msg.target) {
                case NotificationTarget.NODE:
                    if (!state.nodes[msg.node_id!]) state.nodes[msg.node_id!] = [];
                    target_list = state.nodes[msg.node_id!];
                    break;
                case NotificationTarget.SLOT:
                    const slot_key = `${msg.node_id}:${msg.slot_id}`;
                    if (!state.slots[slot_key]) state.slots[slot_key] = [];
                    target_list = state.slots[slot_key];
                    break;
                case NotificationTarget.PARAMETER:
                    const param_key = `${msg.node_id}:${msg.param_id}`;
                    if (!state.parameters[param_key]) state.parameters[param_key] = [];
                    target_list = state.parameters[param_key];
                    break;
                case NotificationTarget.CONNECTION:
                    if (!state.connections[msg.conn_id!]) state.connections[msg.conn_id!] = [];
                    target_list = state.connections[msg.conn_id!];
                    break;
                default:
                    target_list = state.global;
            }

            const existing = target_list.find(notification => 
                notification.message == msg.message &&
                notification.description == msg.description &&
                notification.level == msg.level &&
                notification.node_id == msg.node_id &&
                notification.param_id == msg.param_id &&
                notification.slot_id == msg.slot_id &&
                notification.conn_id == msg.conn_id &&
                !notification.read
            );
            
            if (existing) {
                existing.count += 1;
                existing.timestamp = Date.now();
                existing.read = false;
                return;
            }
            target_list.push({
                ...msg,
                read: false,
                timestamp: Date.now(),
                count: 1
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

    
    public get_notification_key(notification: Notification): string {
        if (isNodeNotify(notification)) return notification.node_id!;
        if (isSlotNotify(notification)) return `${notification.node_id}:${notification.slot_id}`;
        if (isParamNotify(notification)) return `${notification.node_id}:${notification.param_id}`;
        if (isConnNotify(notification)) return notification.conn_id!;
        
        return notification.uid;
    }


    public handle_goto(notification: Notification, space: CanvasSpace) {
        if (notification.node_id != undefined) {
            const node = this.elementController.nodes[notification.node_id];
            if (notification.slot_id != undefined) {
                const slot = node.slots[notification.slot_id];
                if (slot) space.teleport_to_pos(slot.worldPos ?? {x: 0, y: 0})
            }

            space.teleport_to_rect(node.rect);
            return;
        }

        if (notification.conn_id != undefined) {
            const conn = this.elementController.conns[notification.conn_id];
            if (conn) {
                const pos_a = conn.input_slot.worldPos ?? {x: 0, y: 0};
                const pos_b = conn.output_slot.worldPos ?? {x: 0, y: 0};
                const medium: Vector2 = {
                    x: (pos_a.x + pos_b.x) / 2,
                    y: (pos_a.y + pos_b.y) / 2,
                }

                space.teleport_to_pos(medium);
            }
        }
    }

    public relatedToNode(node: SceneNode, ordered: boolean = true) {
        let notifications = this.forAll(ordered);
        return notifications.filter((notif) => notif.node_id == node.uid);
    }

    public forNode(node_uid: string, ordered: boolean = true) {
        const notifications = this._notifications.nodes[node_uid] || [];
        if (ordered) return this.sort_notifications(notifications);
        return notifications;
    }

    public forSlot(node_uid: string, slot_id: string, ordered: boolean = true) {
        const notifications = this._notifications.slots[`${node_uid}:${slot_id}`] || [];
        if (ordered) return this.sort_notifications(notifications);
        return notifications;
    }

    public forParam(node_uid: string, param_id: string, ordered: boolean = true) {
        const notifications = this._notifications.parameters[`${node_uid}:${param_id}`] || [];
        if (ordered) return this.sort_notifications(notifications);
        return notifications;
    }
    
    public forConn(conn_uid: string, ordered: boolean = true) {
        const notifications = this._notifications.connections[conn_uid] || [];
        if (ordered) return this.sort_notifications(notifications);
        return notifications;
    }

    public forGlobal(ordered: boolean = true) {
        const notifications = this._notifications.global || [];
        if (ordered) return this.sort_notifications(notifications);
        return notifications;
    }

    public forAll(ordered: boolean = true) {
        const notifications = [
            ...this.forGlobal(),
            ...Object.values(this._notifications.nodes).flat(),
            ...Object.values(this._notifications.slots).flat(),
            ...Object.values(this._notifications.parameters).flat(),
            ...Object.values(this._notifications.connections).flat(),
        ]
        if (ordered) return this.sort_notifications(notifications);
        return notifications;
    }

    public sort_notifications(notifications: Array<NotificationWithMeta>) {
        return [...notifications].sort(
            (a, b) => (b.timestamp - a.timestamp)
        ).sort(
            (a, b) => (NotificationLevelOrder.indexOf(a.level) - NotificationLevelOrder.indexOf(b.level))
        )
    }
}