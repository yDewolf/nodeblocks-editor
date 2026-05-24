import { ServerMessages } from "../websocket-protocol";

export enum NotificationLevel {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    DEBUG = "debug"
}
export const NotificationLevelOrder = Object.values(NotificationLevel)

export enum NotificationTarget {
    NODE = "node",
    SLOT = "slot",
    PARAMETER = "param",
    CONNECTION = "conn",
    UNSPECIFIED = "unspecified"
}

export interface ServerNotification {
    type: ServerMessages.NOTIFICATION;
    level: NotificationLevel;
    target: NotificationTarget;
    message: string;
    description?: string;
    uid: string;
    
    node_uid?: string;
    slot_id?: string;
    param_id?: string;
    conn_uid?: string;
    
    extra_data?: Record<string, any>;
}

export type NotificationWithMeta = ServerNotification & {
    read: boolean,
    timestamp: number,
    count: number,
    is_virtual: boolean
}

// export type ServerNotification = 
//     | { type: ServerMessages.NOTIFICATION; target: NotificationTarget.UNSPECIFIED; uid: string; level: NotificationLevel, message: string, extra_data?: {[key: string]: any}}
//     | { type: ServerMessages.NOTIFICATION; target: NotificationTarget.NODE; node_uid: string; uid: string; level: NotificationLevel, message: string, extra_data?: {[key: string]: any}}
//     | { type: ServerMessages.NOTIFICATION; target: NotificationTarget.SLOT; node_uid: string; slot_id: string; uid: string; level: NotificationLevel, message: string, extra_data?: {[key: string]: any}}
//     | { type: ServerMessages.NOTIFICATION; target: NotificationTarget.PARAMETER; node_uid: string; param_name: string; uid: string; level: NotificationLevel, message: string, extra_data?: {[key: string]: any}}
//     | { type: ServerMessages.NOTIFICATION; target: NotificationTarget.CONNECTION; conn_uid: string; uid: string; level: NotificationLevel, message: string, extra_data?: {[key: string]: any}}


export const isNodeNotify = (n: ServerNotification) => n.target === NotificationTarget.NODE && !!n.node_uid;
export const isSlotNotify = (n: ServerNotification) => n.target === NotificationTarget.SLOT && !!n.node_uid && !!n.slot_id;
export const isParamNotify = (n: ServerNotification) => n.target === NotificationTarget.PARAMETER && !!n.node_uid && !!n.param_id;
export const isConnNotify = (n: ServerNotification) => n.target === NotificationTarget.CONNECTION && !!n.conn_uid;
export const isUnspecifiedNotify = (n: ServerNotification) => n.target === NotificationTarget.UNSPECIFIED;