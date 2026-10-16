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

export function resolveNotificationLevel(payload: EngineEventPayload): NotificationLevel {
    switch (payload.type) {
        case ServerEngineEventTypes.RUNTIME_ERROR:
        case ServerEngineEventTypes.FAILED_PROCESS:
            return NotificationLevel.ERROR;

        case ServerEngineEventTypes.JOB_STATUS:
            if (payload.status === JobStatus.FAILED) return NotificationLevel.ERROR;
            if (payload.status === JobStatus.PARTIAL_SUCCESS) return NotificationLevel.WARNING;
            if (payload.status === JobStatus.COMPLETED) return NotificationLevel.INFO;
            return NotificationLevel.DEBUG;

        case ServerEngineEventTypes.NODE_STATUS:
            if (payload.status === NodeExecutionStatus.FAILED) return NotificationLevel.ERROR;
            if (payload.status === NodeExecutionStatus.SKIPPED) return NotificationLevel.WARNING;
            return NotificationLevel.DEBUG;

        default:
            return NotificationLevel.INFO;
    }
}

export function resolveShortMessage(payload: any): string {
    switch (payload.type) {
        case ServerEngineEventTypes.RUNTIME_ERROR:
            return "Runtime Error";
        case ServerEngineEventTypes.FAILED_PROCESS:
            return "Process Failure";
        case ServerEngineEventTypes.JOB_STATUS:
            return `Process ${payload.status}`;
        case ServerEngineEventTypes.NODE_STATUS:
            return `Node Status: ${payload.status}`;
        default:
            return "Engine Event";
    }
}

export function resolveEventDescription(payload: EngineEventPayload): string {
    switch (payload.type) {
        case ServerEngineEventTypes.RUNTIME_ERROR:
            return payload.message || "Failed to process a node...";
            
        case ServerEngineEventTypes.FAILED_PROCESS:
            return payload.error || "Failed to process scene...";
            
        case ServerEngineEventTypes.JOB_STATUS:
            return `Scene process status changed to: '${payload.status}'.`;
            
        case ServerEngineEventTypes.NODE_STATUS:
            return `Node execution status changed to: '${payload.status}'.`;
    }
}
