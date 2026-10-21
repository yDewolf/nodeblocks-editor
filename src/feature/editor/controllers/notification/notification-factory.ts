import { nanoid } from "nanoid";
import { JobStatus, NodeExecutionStatus } from "~/protocols/nodeblocks/engine/engine-status-protocols";
import { CmdStatusPack, CommandStatus } from "~/protocols/nodeblocks/engine/server-ipc-event-protocol";
import { EngineEventPayload, EngineTracker } from "~/protocols/nodeblocks/network/message/server/payloads/engine-event-payloads";
import { ServerCmdResponsePayload } from "~/protocols/nodeblocks/network/message/server/payloads/server-response-payloads";
import { ServerEngineEventTypes, ServerCmdResponseTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { Notification, NotificationLevel, NotificationTarget, resolveNotificationTarget } from "~/protocols/notification-protocol";

export class NotificationFactory {
    public static fromEngineEvent(payload: EngineEventPayload): Notification | null {
        if (!payload) return null;

        const rawTracker = payload.tracker || {};
        const tracker: EngineTracker = {
            node_id: rawTracker.node_id || (payload as any).node_uid || undefined,
            slot_id: rawTracker.slot_id || undefined,
            param_id: rawTracker.param_id || undefined,
            conn_id: rawTracker.conn_id || undefined,
        };

        const target = resolveNotificationTarget(tracker);
        const level = this.resolveEngineLevel(payload);
        const shortMessage = this.resolveEngineShortMessage(payload);
        const description = this.resolveEngineDescription(payload);

        return {
            uid: nanoid(),
            level: level,
            target: target,
            message: shortMessage,
            description: description,

            node_id: tracker.node_id,
            slot_id: tracker.slot_id,
            param_id: tracker.param_id,
            conn_id: tracker.conn_id,
        };
    }

    public static fromCommandResponse(payload: ServerCmdResponsePayload): Notification | null {
        if (!payload) return null;

        const level = this.resolveCommandLevel(payload.type, payload.status);
        const shortMessage = this.resolveCommandShortMessage(payload.type);
        const description = this.resolveCommandDescription(payload);

        return {
            uid: payload.request_id,
            level,
            target: NotificationTarget.UNSPECIFIED,
            message: shortMessage,
            description,
        };
    }

    private static resolveEngineLevel(payload: EngineEventPayload): NotificationLevel {
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

    private static resolveEngineShortMessage(payload: EngineEventPayload): string {
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

    private static resolveEngineDescription(payload: EngineEventPayload): string {
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

    private static resolveCommandLevel(cmdType: ServerCmdResponseTypes, status: CmdStatusPack): NotificationLevel {
        if (status.status == CommandStatus.FAILED) {
            return NotificationLevel.ERROR;
        }

        switch (cmdType) {
            case ServerCmdResponseTypes.SAVE_SCENE:
                return NotificationLevel.WARNING
            
            default:
                return NotificationLevel.DEBUG
        }
    }

    private static resolveCommandShortMessage(cmdType: ServerCmdResponseTypes): string {
        switch (cmdType) {
            case ServerCmdResponseTypes.ADD_NODE:
                return "Cmd: Add Node";
            case ServerCmdResponseTypes.ADD_CONN:
                return "Cmd: Add Connection";
            case ServerCmdResponseTypes.EXECUTION_STATE_SYNC:
                return "Cmd: Sync State";
            case ServerCmdResponseTypes.GET_SCENE_DATA:
                return "Cmd: Fetch Scene";
            case ServerCmdResponseTypes.SCENE_WORKER:
                return "Cmd: Worker Action";
            case ServerCmdResponseTypes.SAVE_SCENE:
                return "Saved Scene"
            default:
                return `Cmd: ${cmdType || 'Unknown'}`;
        }
    }

    private static resolveCommandDescription(payload: ServerCmdResponsePayload): string {
        switch (payload.type) {
            case ServerCmdResponseTypes.ADD_NODE:
                return `Added nodes. Total: ${payload.nodes?.length ?? 0}. (request id: ${payload.request_id})`;
            case ServerCmdResponseTypes.ADD_CONN:
                return `Created connections. Total: ${payload.conns?.length ?? 0}. (request id: ${payload.request_id})`;
            case ServerCmdResponseTypes.EXECUTION_STATE_SYNC:
                return `Synced execution state. Mode: [${payload.mode}], State: [${payload.state}].`;
            case ServerCmdResponseTypes.GET_SCENE_DATA:
                return `Fetched scene data from server.`;
            case ServerCmdResponseTypes.SCENE_WORKER:
                return `Processed worker action. (request id: ${payload.request_id})`;
            case ServerCmdResponseTypes.SAVE_SCENE:
                return "Saved Scene."
        }
    }
}