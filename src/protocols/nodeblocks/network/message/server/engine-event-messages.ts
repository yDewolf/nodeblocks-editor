import { JobStatus, NodeExecutionStatus } from "~/protocols/nodeblocks/engine/engine-status-protocols"
import { ServerEngineEventTypes } from "../../server-message-protocol"

type BaseEngineEventPayload = {
    type: ServerEngineEventTypes
    job_id: string
}

export type NodeStatusPayload = BaseEngineEventPayload & {
    type: ServerEngineEventTypes.NODE_STATUS
    node_uid: string
    status: NodeExecutionStatus
    node_result?: Record<string, any>
}

export type JobStatusPayload = BaseEngineEventPayload & {
    type: ServerEngineEventTypes.JOB_STATUS
    status: JobStatus
}

export type FailedProcessPayload = BaseEngineEventPayload & {
    error: string
}

export type EngineEventPayload = NodeStatusPayload | JobStatusPayload | FailedProcessPayload