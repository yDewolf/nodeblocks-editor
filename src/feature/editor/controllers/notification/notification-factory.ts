import { nanoid } from "nanoid";
import { TranslationFunc } from "~/i18n/i18n-locale";
import { JobStatus, NodeExecutionStatus } from "~/protocols/nodeblocks/engine/engine-status-protocols";
import { CmdStatusPack, CommandStatus } from "~/protocols/nodeblocks/engine/server-ipc-event-protocol";
import { EngineEventPayload, EngineTracker } from "~/protocols/nodeblocks/network/message/server/payloads/engine-event-payloads";
import { ServerCmdResponsePayload } from "~/protocols/nodeblocks/network/message/server/payloads/server-response-payloads";
import { ServerEngineEventTypes, ServerCmdResponseTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { Notification, NotificationLevel, NotificationTarget, resolveNotificationTarget } from "~/protocols/notification-protocol";

export class NotificationFactory {
    public static fromEngineEvent(payload: EngineEventPayload, t?: TranslationFunc): Notification | null {
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
        const shortMessage = this.resolveEngineShortMessage(payload, t);
        const description = this.resolveEngineDescription(payload, t);

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

    public static fromCommandResponse(payload: ServerCmdResponsePayload, t?: TranslationFunc): Notification | null {
        if (!payload) return null;

        const level = this.resolveCommandLevel(payload.type, payload.status);
        const shortMessage = this.resolveCommandShortMessage(payload.type, t);
        const description = this.resolveCommandDescription(payload, t);

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
                if (payload.status === NodeExecutionStatus.FAILED) return NotificationLevel.DEBUG;
                if (payload.status === NodeExecutionStatus.SKIPPED) return NotificationLevel.WARNING;
                return NotificationLevel.DEBUG;
            default:
                return NotificationLevel.INFO;
        }
    }

    private static resolveEngineShortMessage(payload: EngineEventPayload, t?: any): string {
        switch (payload.type) {
            case ServerEngineEventTypes.RUNTIME_ERROR:
                return t ? t("notifications.engine.shortMessage.runtimeError") : "Runtime Error";
            case ServerEngineEventTypes.FAILED_PROCESS:
                return t ? t("notifications.engine.shortMessage.failedProcess") : "Process Failure";
            case ServerEngineEventTypes.JOB_STATUS:
                return t ? t("notifications.engine.shortMessage.jobStatus", payload.status) : `Process ${payload.status}`;
            case ServerEngineEventTypes.NODE_STATUS:
                return t ? t("notifications.engine.shortMessage.nodeStatus", payload.status) : `Node Status: ${payload.status}`;
            default:
                return t ? t("notifications.engine.shortMessage.default") : "Engine Event";
        }
    }

    private static resolveEngineDescription(payload: EngineEventPayload, t?: any): string {
        switch (payload.type) {
            case ServerEngineEventTypes.RUNTIME_ERROR:
                return payload.message || (t ? t("notifications.engine.description.runtimeErrorFallback") : "Failed to process a node...");
                
            case ServerEngineEventTypes.FAILED_PROCESS:
                return payload.error || (t ? t("notifications.engine.description.failedProcessFallback") : "Failed to process scene...");
                
            case ServerEngineEventTypes.JOB_STATUS:
                return t ? t("notifications.engine.description.jobStatus", payload.status) : `Scene process status changed to: '${payload.status}'.`;
                
            case ServerEngineEventTypes.NODE_STATUS:
                return t ? t("notifications.engine.description.nodeStatus", payload.status) : `Node execution status changed to: '${payload.status}'.`;
            default:
                return "";
        }
    }

    private static resolveCommandLevel(cmdType: ServerCmdResponseTypes, status: CmdStatusPack): NotificationLevel {
        if (status.status == CommandStatus.FAILED) {
            return NotificationLevel.ERROR;
        }

        switch (cmdType) {
            case ServerCmdResponseTypes.SAVE_SCENE:
                return NotificationLevel.WARNING;
            default:
                return NotificationLevel.DEBUG;
        }
    }

    private static resolveCommandShortMessage(cmdType: ServerCmdResponseTypes, t?: any): string {
        switch (cmdType) {
            case ServerCmdResponseTypes.ADD_NODE:
                return t ? t("notifications.command.shortMessage.addNode") : "Cmd: Add Node";
            case ServerCmdResponseTypes.ADD_CONN:
                return t ? t("notifications.command.shortMessage.addConn") : "Cmd: Add Connection";
            case ServerCmdResponseTypes.EXECUTION_STATE_SYNC:
                return t ? t("notifications.command.shortMessage.executionStateSync") : "Cmd: Sync State";
            case ServerCmdResponseTypes.GET_SCENE_DATA:
                return t ? t("notifications.command.shortMessage.getSceneData") : "Cmd: Fetch Scene";
            case ServerCmdResponseTypes.SCENE_WORKER:
                return t ? t("notifications.command.shortMessage.sceneWorker") : "Cmd: Worker Action";
            case ServerCmdResponseTypes.SAVE_SCENE:
                return t ? t("notifications.command.shortMessage.saveScene") : "Saved Scene";
            default:
                return t ? t("notifications.command.shortMessage.default", cmdType) : `Cmd: ${cmdType || 'Unknown'}`;
        }
    }

    private static resolveCommandDescription(payload: ServerCmdResponsePayload, t?: any): string {
        const statusMsg = payload.status?.message ?? "";
        switch (payload.type) {
            case ServerCmdResponseTypes.ADD_NODE:
                return t 
                    ? t("notifications.command.description.addNode", payload.nodes?.length ?? 0, payload.request_id, statusMsg)
                    : `Added nodes. Total: ${payload.nodes?.length ?? 0}. (request id: ${payload.request_id}) ${statusMsg}`.trim();
            case ServerCmdResponseTypes.ADD_CONN:
                return t 
                    ? t("notifications.command.description.addConn", payload.conns?.length ?? 0, payload.request_id, statusMsg)
                    : `Created connections. Total: ${payload.conns?.length ?? 0}. (request id: ${payload.request_id}) ${statusMsg}`.trim();
            case ServerCmdResponseTypes.EXECUTION_STATE_SYNC:
                return t 
                    ? t("notifications.command.description.executionStateSync", payload.mode, payload.state, statusMsg)
                    : `Synced execution state. Mode: [${payload.mode}], State: [${payload.state}]. ${statusMsg}`.trim();
            case ServerCmdResponseTypes.GET_SCENE_DATA:
                return t ? t("notifications.command.description.getSceneData") : "Fetched scene data from server.";
            case ServerCmdResponseTypes.SCENE_WORKER:
                return t 
                    ? t("notifications.command.description.sceneWorker", payload.request_id, statusMsg)
                    : `Processed worker action. (request id: ${payload.request_id}) ${statusMsg}`.trim();
            case ServerCmdResponseTypes.SAVE_SCENE:
                return t 
                    ? t("notifications.command.description.saveScene", statusMsg)
                    : `Saved current scene in the server. ${statusMsg}`.trim();
            default:
                return "";
        }
    }
}