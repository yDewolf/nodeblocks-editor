import { JobStatus, NodeExecutionStatus } from "./nodeblocks/engine/engine-status-protocols";
import { EngineEventPayload, EngineTracker } from "./nodeblocks/network/message/server/payloads/engine-event-payloads";
import { ServerEngineEventTypes } from "./nodeblocks/network/server-message-protocol";

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

export interface Notification extends EngineTracker {
    level: NotificationLevel
    target: NotificationTarget
    message: string
    description?: string
    uid: string
    
    extra_data?: Record<string, any>
}

export type NotificationWithMeta = Notification & {
    read: boolean
    timestamp: number
    count: number
}

export const isNodeNotify = (n: Notification) => n.target === NotificationTarget.NODE && !!n.node_id;
export const isSlotNotify = (n: Notification) => n.target === NotificationTarget.SLOT && !!n.node_id && !!n.slot_id;
export const isParamNotify = (n: Notification) => n.target === NotificationTarget.PARAMETER && !!n.node_id && !!n.param_id;
export const isConnNotify = (n: Notification) => n.target === NotificationTarget.CONNECTION && !!n.conn_id;
export const isUnspecifiedNotify = (n: Notification) => n.target === NotificationTarget.UNSPECIFIED;

export function resolveNotificationTarget(tracker: EngineTracker): NotificationTarget {
    if (tracker.conn_id) return NotificationTarget.CONNECTION;
    if (tracker.node_id && tracker.slot_id) return NotificationTarget.SLOT;
    if (tracker.node_id && tracker.param_id) return NotificationTarget.PARAMETER;
    if (tracker.node_id) return NotificationTarget.NODE;
    return NotificationTarget.UNSPECIFIED;
}
