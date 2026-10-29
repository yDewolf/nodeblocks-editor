import { JobStatus, NodeExecutionStatus } from "~/protocols/nodeblocks/engine/engine-status-protocols"
import { ServerEngineEventTypes } from "../../../server-message-protocol"
import { SerializedDataTypeValue } from "~/protocols/nodeblocks/manifests/node/datatype-value-meta"

export interface EngineTracker {
    node_id?: string
    slot_id?: string
    param_id?: string
    conn_id?: string
    other?: Record<string, string>
}

type BaseEngineEventPayload = {
    type: ServerEngineEventTypes
    tracker: EngineTracker
    job_id: string
}

export type NodeStatusPayload = BaseEngineEventPayload & {
    type: ServerEngineEventTypes.NODE_STATUS
    node_uid: string
    status: NodeExecutionStatus
    node_result?: Record<string, SerializedDataTypeValue>
}

export type JobStatusPayload = BaseEngineEventPayload & {
    type: ServerEngineEventTypes.JOB_STATUS
    status: JobStatus
}

export type FailedProcessPayload = BaseEngineEventPayload & {
    type: ServerEngineEventTypes.FAILED_PROCESS
    error: string
}

export type RuntimeErrorPayload = BaseEngineEventPayload & {
    type: ServerEngineEventTypes.RUNTIME_ERROR
    message: string
}

export type EngineEventPayload = NodeStatusPayload | JobStatusPayload | FailedProcessPayload | RuntimeErrorPayload;
