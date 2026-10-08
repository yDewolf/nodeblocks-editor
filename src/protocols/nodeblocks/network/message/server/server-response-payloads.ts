import { SceneWorkerExecutionMode, SceneWorkerExecutionState } from "../../scene-worker-protocol"
import { ServerCmdResponseTypes } from "../../server-message-protocol"
import { CmdStatusPack } from "./server-event-protocol"

export type CommandResponsePayload = {
    type: ServerCmdResponseTypes

    request_id: string,
    status: CmdStatusPack
}

export type GenericCmdPayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.SCENE_WORKER
}

export type ExecutionCheckPayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.EXECUTION_STATE_CHECK
    state: SceneWorkerExecutionState
    mode: SceneWorkerExecutionMode
}

export type AddNodePayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.ADD_NODE
    nodes?: Array<string>
}

export type AddConnPayload = CommandResponsePayload & {
    conns?: Array<string>
}


export type ServerCmdResponsePayload = 
    | GenericCmdPayload | ExecutionCheckPayload 
    | AddNodePayload | AddConnPayload
